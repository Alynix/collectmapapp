<template>
    <div class="map-wrapper">

      

      <div class="map-right-sidebar">
        <div class="map-search" ref="search_container_el"></div>
          <slot name="right-sidebar"></slot>
      </div>

      <div ref="map_el" class="map"></div>

      
      

      <div ref="superblocksWrapper" class="sb-container" v-show="isVisible"></div>

      <div class="dialogue">

        <p> NBI Bridge Clustering Tool</p>
        
        <p> 
          <button @click="isVisible = !isVisible"> Bridge Selection Tool </button>
          <button @click="clearAllLayers()"> Restart </button>
          <button @click="resetView()"> Zoom to Region </button>

          
          <button @click="mapStore.showDraw = !mapStore.showDraw"> <span v-show="!mapStore.showDraw">Show</span> <span v-show="mapStore.showDraw">Hide</span> Polygon </button>
        
          <button @click="mapStore.showBridges = !mapStore.showBridges"> <span v-show="!mapStore.showBridges">Show</span> <span v-show="mapStore.showBridges">Hide</span> Bridges </button>

          <button @click="mapStore.showClusters = !mapStore.showClusters"> <span v-show="!mapStore.showClusters">Show</span> <span v-show="mapStore.showClusters">Hide</span> Clusters </button>
        
          <button @click="mapStore.showCounties = !mapStore.showCounties"> <span v-show="!mapStore.showCounties">Show</span> <span v-show="mapStore.showCounties">Hide</span> Counties </button>


        </p>

      </div>

      <div class="calculation-box">
          <p>Area:</p>
          <div id="calculated-area">
            {{ mapStore.calcArea }} km^2
          </div>
      </div>
    </div>
</template>
  
<script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import mapboxgl from 'mapbox-gl';
  import { MapboxAddressAutofill, MapboxSearchBox, MapboxGeocoder, config } from '@mapbox/search-js-web'

  
  import MapboxDraw from "@mapbox/mapbox-gl-draw";  

  mapboxgl.accessToken = 'pk.eyJ1IjoiY21lcnJpZ2FuIiwiYSI6ImNtNjlrNHJoNjBneDkybG4zaW5mZnE1OHoifQ.6K-waLtuExh_XFxgOD-E1w';

  import { createSuperblocksEmbed } from '@superblocksteam/embed';

  
  import 'mapbox-gl/dist/mapbox-gl.css';

  import * as turf from "@turf/turf";

  import { useMapStore } from "@/stores/mapstore"
  
  const superblocksWrapper = ref(null)
  const sbAPP = ref(null)



  const map_el = ref(null);
  const map_instance = ref(null);

  const mapStore = useMapStore();


  const draw_instance = ref(null);

  const search_container_el = ref(null);

  const isVisible = ref(false)

  const bbox = ref([-94.769437,38.924986,-94.763933,38.927766])

  const drawPolygon = ref({})

  

  onMounted(() => {
    
    map_instance.value = new mapboxgl.Map({
      container: map_el.value,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Use your desired Mapbox style
      center: mapStore.mapCenter, 
      zoom: mapStore.mapZoom,
    });

    const searchBoxElement = new MapboxSearchBox();
    searchBoxElement.accessToken = mapboxgl.accessToken;

    searchBoxElement.mapboxgl = mapboxgl

    // bind the search box instance to the map instance
    searchBoxElement.bindMap(map_instance.value)
    search_container_el.value.appendChild(searchBoxElement);


    draw_instance.value = new MapboxDraw({
          displayControlsDefault: false,
          // Select which mapbox-gl-draw control buttons to add to the map_instance.
          controls: {
              polygon: true,
              trash: true
          },
          // Set mapbox-gl-draw to draw by default.
          // The user does not have to click the polygon control button first.
          defaultMode: 'draw_polygon'
    });
    map_instance.value.addControl(draw_instance.value);

    mapStore.mapbox_instance = map_instance;
    mapStore.mapboxdraw_instance = draw_instance;

    // ON LOAD
    mapStore.mapbox_instance.on("load",() => {
      mapStore.map_mounted = true;

      map_instance.value.addSource("counties", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: 'https://decker-public-hosting.s3.us-east-2.amazonaws.com/georef-united-states-of-america-county.geojson'
      });

      map_instance.value.on('draw.create', updateArea);
      map_instance.value.on('draw.delete', updateArea);
      map_instance.value.on('draw.update', updateArea);

      map_instance.value.on('click', 'counties', (e) => {
            //console.log(e.features[0].geometry)
            
            draw_instance.value.deleteAll()

            draw_instance.value.add(e.features[0].geometry)

            updateArea()
            
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(e.features[0].properties.coty_name+e.features[0].properties.ste_name)
                .addTo(map_instance.value);
        });

    })
   

    // register move and zoom events to persist map viewport
    map_instance.value.on('move', (e) => {
      storeViewport(map_instance.value.getCenter(), map_instance.value.getZoom())
    })

    

  sbAPP.value = createSuperblocksEmbed({
        src: "https://app.superblocks.com/embed/applications/7246b0b7-e120-4d22-949a-71cca2a7ecba",
        colorScheme: "dark",
        id: "sb-embed",
        onEvent: handleEvent,
        // No properties defined. Use the Embed panel to add properties and uncomment this block.
        properties: { EmbedGeoPolygon: drawPolygon.value }
    });
    
  superblocksWrapper.value.appendChild(sbAPP.value);

  });

  watch(drawPolygon,(newValue,oldValue)=>{
    //console.log('Old',oldValue)
    //console.log('New',newValue)
    sbAPP.value.properties = {EmbedGeoPolygon:newValue}
  })

  onUnmounted(() => {
    mapStore.map_mounted = false;

  });

  function updateArea(e) {
        const data = draw_instance.value.getAll();
        
        if (data.features.length > 0) {
            const area = turf.area(data) / 1e6;

            bbox.value = turf.bbox(data)

            console.log(data.features[0].geometry)
            drawPolygon.value = data.features[0].geometry

            // Restrict the area to 2 decimal points.
            mapStore.calcArea = Math.round(area * 100) / 100;
            
        } else {

          mapStore.calcArea = 0;
        }
  }

  function storeViewport(center, zoom) {
    mapStore.mapCenter = center;
    mapStore.mapZoom = zoom;
  }

  // Function to zoom to coordinates
  function zoomToCoordinates(lng, lat, zoomLevel=15) {
    map_instance.value.flyTo({
      center: [lng, lat],
      zoom: zoomLevel
    });
  }

  const resetView = () => {

    isVisible.value = false

    map_instance.value.fitBounds(bbox.value)
  }

  const handleEvent = (eventName, payload) => {

    switch(eventName){

      case "buttonClicked":

        clearAllLayers()

        map_instance.value.addSource("bridges", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.bridges

            });

        map_instance.value.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color': '#000000',
                    'circle-radius': 6
                }
          });

          map_instance.value.addSource("clusters", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.clusters

            });

        map_instance.value.addLayer({
                id: "clusters",
                type: 'circle',
                source: "clusters",
                paint: {
                    'circle-color': '#FF0000',
                    'circle-radius': 6
                }
          });

          map_instance.value.addSource("polygons", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.polygons

            });

        map_instance.value.addLayer({
                id: "polygons",
                type: 'fill',
                source: 'polygons',
                paint: {
                    'fill-color': '#f08',
                    'fill-opacity': 0.4
                }
          });

        break;
      case "clusterSplit":

        if (map_instance.value.getLayer("polygons2")) {
          map_instance.value.removeLayer("polygons2");
        }

        if (map_instance.value.getSource("polygons2")) {
          map_instance.value.removeSource("polygons2");
        }

        map_instance.value.addSource("polygons2", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.polygons

            });

        map_instance.value.addLayer({
                id: "polygons2",
                type: 'fill',
                source: 'polygons2',
                paint: {
                    'fill-color': '#FFFF00',
                    'fill-opacity': 0.6
                }
          });

        break;
      case "rowClicked1":
        isVisible.value = false
        zoomToCoordinates(payload.coords[0],payload.coords[1])
        break;
      case "zoomBridge":
        isVisible.value = false
        zoomToCoordinates(payload.coords[0],payload.coords[1],18)
        break;
      default:
        // default here 


    }

  }

  const clearLayer = (tag) => {
    if (map_instance.value.getLayer(tag)) {
      map_instance.value.removeLayer(tag);
    }

    if (map_instance.value.getSource(tag)) {
      map_instance.value.removeSource(tag);
    }
  }

  const clearAllLayers = () => {
    const layers = ["bridges","clusters","polygons"];

    for(let layer of layers){
      clearLayer(layer);
    }
  }
  

</script>
  
<style scoped>
 
.map-wrapper {
  position: relative;
}

.map {
    display: flex;
    height: 100vh;
}

.sb-container {
  position: absolute;
  bottom: 12px;
  left: 15px;
  width: 98%;
  height: 90%;
  background: #000;
  color: #FFF;
}

.dialogue {
  position: absolute;
  top: 6px;
  left: 0px;
  width: 100%;
  height: 70px;
  background: #624cdb;
  color: #FFF;
}

.map-right-sidebar {
  position: absolute;
  top: 15px;
  right: 50px;
  width: 330px;
  max-width: 500px;
  z-index: 200;
}

.calculation-box {
        height: 80px;
        width: 150px;
        position: absolute;
        bottom: 10px;
        left: 10px;
        background-color: rgba(240, 172, 47, 0.9);
        padding: 16px;
        text-align: center;
}

p {
        font-family: 'Open Sans';
        margin: 0;
        font-size: 24px;
}

button {
        font-family: 'Open Sans';
        margin: 0;
        font-size: 18px;
}

</style>
<template>
    <div class="map-wrapper">

      

      <div class="map-right-sidebar">
        <div class="map-search" ref="search_container_el"></div>
          <slot name="right-sidebar"></slot>
      </div>

      <div ref="map_el" class="map"></div>

      
      

      <div ref="superblocksWrapper" class="sb-container" v-show="mapStore.isVisible"></div>

      <div class="dialogue">

        <div class="p-3 w-100% bg-gray-900 text-white">
          <p> NBI Bridge Clustering Tool</p>

          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md"@click="mapStore.isVisible = !mapStore.isVisible"> Bridge Selection Tool </button>
          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md"@click="clearAllLayers(true)"> Restart </button>
          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md"@click="resetView(bbox)"> Zoom to Region </button>

          
          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md" @click="mapStore.showDraw = !mapStore.showDraw"> <span v-show="!mapStore.showDraw">Show</span> <span v-show="mapStore.showDraw">Hide</span> Polygon </button>
        
          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md" @click="mapStore.showBridges = !mapStore.showBridges"> <span v-show="!mapStore.showBridges">Show</span> <span v-show="mapStore.showBridges">Hide</span> Bridges </button>

          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md" @click="mapStore.showClusters = !mapStore.showClusters"> <span v-show="!mapStore.showClusters">Show</span> <span v-show="mapStore.showClusters">Hide</span> Clusters </button>
        
          <button class="bg-green-500 mx-2 p-2 text-xs rounded-md" @click="mapStore.showCounties = !mapStore.showCounties"> <span v-show="!mapStore.showCounties">Show</span> <span v-show="mapStore.showCounties">Hide</span> Counties </button>


        </div>

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

  import { useMapStore } from "@/stores/mapstore";
  
  const superblocksWrapper = ref(null)
  const sbAPP = ref(null)



  const map_el = ref(null);
  const map_instance = ref(null);

  const mapStore = useMapStore();


  const draw_instance = ref(null);

  const search_container_el = ref(null);

  const bbox = ref([-94.769437,38.924986,-94.763933,38.927766])

  const cluster_bbox = ref([])

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
            
            draw_instance.value.deleteAll()

            draw_instance.value.add(e.features[0].geometry)

            mapStore.showCounties = false

            updateArea()

            const county = e.features[0].properties.coty_name.replace("]","").replace("[","").slice(1,-1)

            const state = e.features[0].properties.ste_name.replace("]","").replace("[","").slice(1,-1)

            const msg = `<div class="bg-yellow-300 p-4 text-black"><h2>${county} county, ${state}<h2></div>`
            
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(msg)
                .addTo(map_instance.value);
        });

    })

    // register move and zoom events to persist map viewport
    map_instance.value.on('move', (e) => {
      storeViewport(map_instance.value.getCenter(), map_instance.value.getZoom())
    })

    

  sbAPP.value = createSuperblocksEmbed({
        src: "https://app.superblocks.com/embed/applications/7472fe5c-cb1c-41c4-8026-bca71ddf467a",
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

  const resetView = (view_bbox) => {

    mapStore.isVisible = false;

    map_instance.value.fitBounds(view_bbox)
  }

  const handleEvent = (eventName, payload) => {

    switch(eventName){

      case "bridgesReturned":

        clearLayer("bridges")

        map_instance.value.addSource("bridges", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.bridges

            });

        map_instance.value.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color': "#1F51FF",
                    'circle-radius': 6,
                    'circle-stroke-color':"#000000",
                    'circle-stroke-width':1
                }
          });

        break;
      case "clustersReturned":
        
        clearLayer("clusters")

        map_instance.value.addSource("clusters", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.clusters

            });

        map_instance.value.addLayer({
                id: "clusters",
                type: 'fill',
                source: "clusters",
                paint: {
                    'fill-color' : [
                      'case',
                      ['==', ['get', 'saved'], true], '#FF0000',
                      '#FFFF00'
                    ],
                    'fill-opacity': 0.5,
                    'fill-outline-color': "#000000"
                }
          });

        break;
      
      case "clusterSplit":
        //split the cluster 

      case "clustersMerged":
        //merge the clusters

      case "zoomToCluster":

        cluster_bbox.value = turf.bbox(payload.polygon); 
        
        mapStore.isVisible = false;

        resetView(cluster_bbox.value);


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

  const clearAllLayers = (clear_draw=false) => {

    if (clear_draw){
      draw_instance.value.deleteAll()
    }
    
    const layers = ["bridges","clusters"];

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
  top: 0px;
  left: 0px;
  width: 100%;
  height: 60px;
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
        background-color: rgba(240, 228, 67, 0.9);
        padding: 0px;
        text-align: center;
}

p {
        font-family: 'Open Sans';
        margin: 0;
        font-size: 32px;
}

</style>
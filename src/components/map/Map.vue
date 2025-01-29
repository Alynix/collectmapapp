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
          <button @click="clearBridges()"> Clear Bridges </button>
          <button @click="resetView()"> Zoom to Region </button>
        </p>

        
      
      
      
      </div>

      <div class="calculation-box">
          <p>Click to draw a polygon.</p>
      <div id="calculated-area"></div>
</div>

    </div>
</template>
  
<script setup>
  import { onMounted, ref } from 'vue';
  import mapboxgl from 'mapbox-gl';
  import { MapboxAddressAutofill, MapboxSearchBox, MapboxGeocoder, config } from '@mapbox/search-js-web'

  mapboxgl.accessToken = 'pk.eyJ1IjoiY21lcnJpZ2FuIiwiYSI6ImNtNjlrNHJoNjBneDkybG4zaW5mZnE1OHoifQ.6K-waLtuExh_XFxgOD-E1w';

  import { createSuperblocksEmbed } from '@superblocksteam/embed';

  import MapboxDraw from "@mapbox/mapbox-gl-draw"; 
  import 'mapbox-gl/dist/mapbox-gl.css';

  import * as turf from "@turf/turf";
  
  const superblocksWrapper = ref(null)

  const sbAPP = ref(null)

  const map_el = ref(null);
  const map = ref(null);

  const draw = ref(null);


  const search_container_el = ref(null);


  const isVisible = ref(false)

  const bbox = ref([-94.769437,38.924986,-94.763933,38.927766])

  // Function to zoom to coordinates
  function zoomToCoordinates(lng, lat, zoomLevel=15) {
    map.value.flyTo({
      center: [lng, lat],
      zoom: zoomLevel
    });
  }

  const resetView = () => {

    isVisible.value = false

    map.value.fitBounds(bbox.value)
  }

  function updateArea(e) {
        const data = draw.value.getAll();
        const answer = document.getElementById('calculated-area');
        if (data.features.length > 0) {
            const area = turf.area(data) / 1e6;

            bbox.value = turf.bbox(data)

            sbAPP.value.properties = { EmbedBBOX: bbox.value }

            //sbAPP.value.trigger("newBBOX",{"bbox":[0,1,2,3]})

            // Restrict the area to 2 decimal points.
            const rounded_area = Math.round(area * 100) / 100;
            answer.innerHTML = `<p><strong>${rounded_area} km^2</strong>`;
        } else {
            answer.innerHTML = '';
            if (e.type !== 'draw.delete')
                alert('Click the map to draw a polygon.');
        }
    }


  const handleEvent = (eventName, payload) => {

    switch(eventName){

      case "buttonClicked":

        clearBridges()

        map.value.addSource("bridges", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.bridges

            });

        map.value.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color': '#000000',
                    'circle-radius': 6
                }
          });

          map.value.addSource("clusters", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.clusters

            });

        map.value.addLayer({
                id: "clusters",
                type: 'circle',
                source: "clusters",
                paint: {
                    'circle-color': '#FF0000',
                    'circle-radius': 6
                }
          });

          map.value.addSource("polygons", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.polygons

            });

        map.value.addLayer({
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

        if (map.value.getLayer("polygons2")) {
          map.value.removeLayer("polygons2");
        }

        if (map.value.getSource("polygons2")) {
          map.value.removeSource("polygons2");
        }

        map.value.addSource("polygons2", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.polygons

            });

        map.value.addLayer({
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

  const clearBridges = ()=>{

    if (map.value.getLayer("bridges")) {
      map.value.removeLayer("bridges");
    }

    if (map.value.getSource("bridges")) {
      map.value.removeSource("bridges");
    }

    if (map.value.getLayer("clusters")) {
      map.value.removeLayer("clusters");
    }

    if (map.value.getSource("clusters")) {
      map.value.removeSource("clusters");
    }

    if (map.value.getLayer("polygons")) {
      map.value.removeLayer("polygons");
    }

    if (map.value.getSource("polygons")) {
      map.value.removeSource("polygons");
    }

    if (map.value.getLayer("polygons2")) {
        map.value.removeLayer("polygons2");
    }

    if (map.value.getSource("polygons2")) {
      map.value.removeSource("polygons2");
    }

  }

  onMounted(() => {
    
  
    map.value = new mapboxgl.Map({
      container: map_el.value,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Use your desired Mapbox style
      center: [-94.765146, 38.926882], 
      zoom: 11.5
    });

    const searchBoxElement = new MapboxSearchBox();
    searchBoxElement.accessToken = mapboxgl.accessToken;

    searchBoxElement.mapboxgl = mapboxgl

    // bind the search box instance to the map instance
    searchBoxElement.bindMap(map.value)
    search_container_el.value.appendChild(searchBoxElement);


    draw.value = new MapboxDraw({
        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        controls: {
            polygon: true,
            trash: true
        },
        // Set mapbox-gl-draw to draw by default.
        // The user does not have to click the polygon control button first.
        defaultMode: 'draw_polygon'
    });
    map.value.addControl(draw.value);

    map.value.on('draw.create', updateArea);
    map.value.on('draw.delete', updateArea);
    map.value.on('draw.update', updateArea);


    map.value.on('load', () => {

      map.value.addSource('homepoint', {
    type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
    data: {

                            "type": "Feature",

                            "properties": {

                              "name": "Alynix"

                            },

                            "geometry": {

                              "type": "Point",

                              "coordinates": [-94.765146, 38.926882]
                            }

          } 

  });

    //createSources();

});

  sbAPP.value = createSuperblocksEmbed({
        src: "https://app.superblocks.com/embed/applications/7246b0b7-e120-4d22-949a-71cca2a7ecba",
        colorScheme: "dark",
        id: "sb-embed",
        onEvent: handleEvent,
        // No properties defined. Use the Embed panel to add properties and uncomment this block.
        properties: { EmbedBBOX: bbox.value }
    });
    
  superblocksWrapper.value.appendChild(sbAPP.value);

  });

  

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
        width: 270px;
        position: absolute;
        bottom: 40px;
        left: 10px;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 15px;
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
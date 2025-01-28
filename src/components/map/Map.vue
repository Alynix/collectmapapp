<template>
    <div class="map-wrapper">
      <div class="dialogue"> Bridge clustering map... 
      
      <button @click="isVisible = !isVisible"> Hide </button>
      
      </div>
      <div ref="mapContainer" class="map-container"></div>

      <div ref="superblocksWrapper" class="sb-container" v-show="isVisible"></div>

    </div>
</template>
  
<script setup>
  import { onMounted, ref } from 'vue';
  import mapboxgl from 'mapbox-gl';

  import { createSuperblocksEmbed } from '@superblocksteam/embed'
  
  const superblocksWrapper = ref(null)

  const sbAPP = ref(null)

  const mapContainer = ref(null);
  const map = ref(null);

  const isVisible = ref(true)


  const handleEvent = (eventName, payload) => {

    console.log(eventName,payload.arg1);

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

    map.value.addSource("bridges", {
    type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
    data: payload.arg1.bridges

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
    data: payload.arg1.clusters

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

      

  }

  const updateSources = ()=>{
  }

  onMounted(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY21lcnJpZ2FuIiwiYSI6ImNtNjlrNHJoNjBneDkybG4zaW5mZnE1OHoifQ.6K-waLtuExh_XFxgOD-E1w'; // Replace with your actual token
  
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Use your desired Mapbox style
      center: [-94.765146, 38.926882], 
      zoom: 11.5
    });

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
        onEvent: handleEvent
        // No properties defined. Use the Embed panel to add properties and uncomment this block.
        // properties: { EmbedProp1: "Hello World" }
    });
    
  superblocksWrapper.value.appendChild(sbAPP.value);

  console.log(sbAPP.value instanceof HTMLElement)


  //sbAPP.value.addEventListener('buttonClicked', (event) => {console.log('Event1 EMITTED!');})

  //sbAPP.value.onEvent()


  });

  

</script>
  
<style scoped>
 
.map-wrapper {
  position: relative;
}

.map-container {
    display: flex;
    height: 100vh;
}

.sb-container {
  position: absolute;
  top: 35px;
  left: 15px;
  width: 98%;
  height: 80%;
  background: #000;
  color: #FFF;
}

.dialogue {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 300px;
  background: #000;
  color: #FFF;
}

</style>
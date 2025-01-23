<template>
    <div class="map-wrapper">
      <div class="dialogue"> Bridge clustering map... 
      
      <button @click="updateSources()"> Refresh </button>
      
      </div>
      <div ref="mapContainer" class="map-container"></div>
    </div>
</template>
  
<script setup>
  import { onMounted, ref } from 'vue';
  import mapboxgl from 'mapbox-gl';
  
  const mapContainer = ref(null);
  const map = ref(null);

  const updateSources = ()=>{

    const layer1 = map.value.removeLayer('bridges');
    const layer2 = map.value.removeLayer('centers');
    const layer3 = map.value.removeLayer('polygons');

    const source1 = map.value.removeSource('bridges');
    const source2 = map.value.removeSource('centers');
    const source3 = map.value.removeSource('polygons');
    
    

    createSources();

  }

  const createSources = ()=>{

    map.value.addSource('bridges', {
    type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
    data: `https://decker-public-hosting.s3.us-east-2.amazonaws.com/bridges.geojson?${Date.now()}`,
    //dynamic: true
  });

  map.value.addSource('centers', {
    type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
    data: `https://decker-public-hosting.s3.us-east-2.amazonaws.com/centers.geojson?${Date.now()}`,
    //dynamic: true
  });

  map.value.addSource('polygons', {
    type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
    data: `https://decker-public-hosting.s3.us-east-2.amazonaws.com/polygons.geojson?${Date.now()}`,
    //dynamic: true
  });

  map.value.addLayer({
            id: 'homepoint',
            type: 'circle',
            source: 'homepoint',
            paint: {
                'circle-color': '#FFD700',
                'circle-radius': 8
            }
        });

    map.value.addLayer({
            id: 'bridges',
            type: 'circle',
            source: 'bridges',
            paint: {
                'circle-color': '#51bbd6',
                'circle-radius': 5
            }
        });

    map.value.addLayer({
        id: 'centers',
        type: 'circle',
        source: 'centers',
        paint: {
            'circle-color': '#FF4B33',
            'circle-radius': 5
        }
    });

    map.value.addLayer({
        id: 'polygons',
        type: 'fill',
        source: 'polygons',
        paint: {
            'fill-color': '#f08',
            'fill-opacity': 0.4
        }
    });



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

    createSources();

});

   

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

.dialogue {
  position: absolute;
  top: 75px;
  left: 75px;
  width: 500px;
  background: #000;
  color: #FFF;
}

</style>
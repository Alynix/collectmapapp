<script setup>
import { useMapStore } from '@/stores/mapstore';
import { onMounted, onUnmounted, ref } from 'vue';

const mapStore = useMapStore();

onMounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getSource("counties")){

        map_instance.addLayer({
              id: "counties",
                  type: 'fill',
                  source: 'counties',
                  paint: {
                      'fill-color': '#65FE08',
                      'fill-outline-color': '#000000',
                      'fill-opacity': 0.6
                      
                  }
      });

      map_instance.addLayer({
              id: "counties-line",
                  type: 'line',
                  source: 'counties',
                  paint: {
                      'line-color': '#000000',
                      'line-width': 3
                      
                  }
      });

    }

})

onUnmounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getLayer("counties")) {
      map_instance.removeLayer("counties");
    }

    if (map_instance.getLayer("counties-line")) {
      map_instance.removeLayer("counties-line");
    }
})

</script>

<template>

</template>
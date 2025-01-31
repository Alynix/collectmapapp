<script setup>
import { useMapStore } from '@/stores/mapstore';
import { onMounted, onUnmounted, ref } from 'vue';

const mapStore = useMapStore();

onMounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getSource("bridges")){
        map_instance.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color': {
                        type: 'identity',
                        property: 'color',
                    },
                    'circle-radius': 6,
                    'circle-stroke-color':"#000000",
                    'circle-stroke-width':1
                }
          });
    }

})

onUnmounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getLayer("bridges")) {
      map_instance.removeLayer("bridges");
    }
})

</script>
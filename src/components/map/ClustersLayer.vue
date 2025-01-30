<script setup>
import { useMapStore } from '@/stores/mapstore';
import { onMounted, onUnmounted, ref } from 'vue';

const mapStore = useMapStore();

onMounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getSource("polygons")){
        map_instance.addLayer({
            id: "polygons",
                type: 'fill',
                source: 'polygons',
                paint: {
                    'fill-color': '#f08',
                    'fill-opacity': 0.4
                }
        });
    }

    if (map_instance.getSource("clusters")){
        map_instance.addLayer({
                id: "clusters",
                type: 'circle',
                source: "clusters",
                paint: {
                    'circle-color': '#FF0000',
                    'circle-radius': 6
                }
        });
    }

})

onUnmounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getLayer("clusters")) {
      map_instance.removeLayer("clusters");
    }

    if (map_instance.getLayer("polygons")) {
      map_instance.removeLayer("polygons");
    }
})

</script>
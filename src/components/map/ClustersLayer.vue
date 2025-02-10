<script setup>
import { useMapStore } from '@/stores/mapstore';
import { polygonSmooth } from '@turf/turf';
import { onMounted, onUnmounted, ref, nextTick } from 'vue';

import mapboxgl from 'mapbox-gl';

const mapStore = useMapStore();

const selectedCluster = ref(null);

const popupContent = ref(null);

onMounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getSource("polygons")){
        map_instance.addLayer({
                id: "polygons",
                type: 'fill',
                source: 'polygons',
                paint: {
                    'fill-color': {
                        type: 'identity',
                        property: 'color',
                    },
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
                    'circle-color': {
                        type: 'identity',
                        property: 'color',
                    },
                    'circle-radius': 8,
                    'circle-stroke-color':"#FFFFFF",
                    'circle-stroke-width':1
                }
          });
    }

    //click event for polygons 

    map_instance.on('click', 'polygons', async (e) => {
        selectedCluster.value = e.features[0]
        
        // Need the dom update cycle to complete 
        // so that the NBI popup is mounted and rendered
        await nextTick();

        new mapboxgl.Popup({anchor: 'bottom-right'})
            .setLngLat(e.lngLat)
            .setDOMContent(
                popupContent.value
            )
            .addTo(map_instance);

    });

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

const showApp = () => {
    mapStore.isVisible = true;
}

</script>

<template>
    <div class="popup-content" v-if="selectedCluster != null" ref="popupContent">
        <div class="p-3 w-96 bg-gray-900 text-white">
            <span class="text-lg font-bold">Cluster id: {{selectedCluster.properties['pk']}}</span>
            <div class="grid grid-cols-3 py-3">
                <div>
                    <div>{{selectedCluster.properties['clusterSize']}}</div>
                    <div class="text-gray-400"> Bridge Count </div>
                </div>
                <div>
                    <div>{{selectedCluster.properties['bridges']}}</div>
                    <div class="text-gray-400"> Bridges</div>
                </div>
                <div>
                    
                </div>

                <span>
                    <button class="bg-green-500 mx-2 p-2 text-xs rounded-md">
                        <span @click="showApp()">View Details</span>
                    </button>
                </span>


            </div>

            

        </div>
        
    </div>
</template>
<script setup>
import { useMapStore } from '@/stores/mapstore';
import { polygonSmooth } from '@turf/turf';
import { onMounted, onUnmounted, ref, nextTick } from 'vue';

import mapboxgl from 'mapbox-gl';

const mapStore = useMapStore();

const selectedCluster = ref(null);

const popupContent = ref(null);

const clickCallback = async (e) => {
    selectedCluster.value = e.features[0]

    // Need the dom update cycle to complete 
    // so that the NBI popup is mounted and rendered
    await nextTick();

    new mapboxgl.Popup({anchor: 'bottom-right'})
        .setLngLat(e.lngLat)
        .setDOMContent(
            popupContent.value
        )
        .addTo(mapStore.mapbox_instance);

}

onMounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getSource("clusters")){
        map_instance.addLayer({
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
    }

    //click event for polygons 

    map_instance.on('click', 'clusters', clickCallback);

})

onUnmounted(() => {
    let map_instance = mapStore.mapbox_instance

    map_instance.off('click', 'clusters', clickCallback);

    if (map_instance.getLayer("clusters")) {
      map_instance.removeLayer("clusters");
    }

})

const triggerModalOpen = (cluster_id) => {
    
    mapStore.isVisible = true;
    mapStore.sbAPP.trigger('openClusterModal', {"cluster_id":String(cluster_id)}) 

}

const checkSaved = (properties) => {
    if (properties['saved'] == true){
        return true
    }
    return false
}

const deleteCluster = (cluster_id) => {

    mapStore.deleteCluster(cluster_id)

    selectedCluster.value = null;

    mapStore.displayPlanPolygon();

}

</script>

<template>
    <div class="popup-content" v-if="selectedCluster != null" ref="popupContent">
        <div class="p-3 w-96 bg-gray-900 text-white">
            <span class="text-lg font-bold">Cluster id: {{selectedCluster.id}}</span>
            <div class="grid grid-cols-3 py-3">
                <div>
                    <div>{{selectedCluster.properties['macro_plan']}}</div>
                    <div class="text-gray-400"> Macro Plan </div>
                </div>
                <div>
                    <div>{{selectedCluster.properties['clusterSize']}}</div>
                    <div class="text-gray-400"> Bridge Count </div>
                </div>
                <div>
                    <div>{{selectedCluster.properties['bridges']}}</div>
                    <div class="text-gray-400"> Bridges</div>
                </div>

            </div>

            <span>
                    <button v-if="checkSaved(selectedCluster.properties)" class="bg-green-500 mx-2 p-2 text-xs rounded-md">
                        <span @click="triggerModalOpen(selectedCluster.id)">View Details</span>
                    </button>
                    <button v-if="checkSaved(selectedCluster.properties)" class="bg-red-500 mx-2 p-2 text-xs rounded-md">
                        <span @click="deleteCluster(selectedCluster.id)">Delete Cluster</span>
                    </button>
            </span>

            

        </div>
        
    </div>
</template>
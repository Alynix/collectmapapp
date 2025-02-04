<script setup>
import { useMapStore } from '@/stores/mapstore';
import { onMounted, onUnmounted, ref, nextTick} from 'vue';

import mapboxgl from 'mapbox-gl';

const mapStore = useMapStore();

const selectedBridge = ref(null);

const selectedLat = ref(null);
const selectedLong = ref(null);

const url = ref(null);

const popupContent = ref(null);

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

    map_instance.on('click', 'bridges', async (e) => {
        selectedBridge.value = e.features[0]

        selectedLat.value = selectedBridge.value.properties['latitude']
        selectedLong.value = selectedBridge.value.properties['longitude']

        url.value = "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + selectedLat.value + "," + selectedLong.value
        
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

    if (map_instance.getLayer("bridges")) {
      map_instance.removeLayer("bridges");
    }
})

const showApp = () => {
    mapStore.isVisible = true;
}

</script>

<template>
    <div class="popup-content" v-if="selectedBridge != null" ref="popupContent">
        <div class="p-3 w-96 bg-gray-900 text-white">
            <span class="text-lg font-bold">NBI {{selectedBridge.properties['nbi_objectid']}}</span>
            <div class="grid grid-cols-6 py-3">
                <div>
                    <div>{{selectedBridge.properties['DECK_WIDTH_MT_052']}}</div>
                    <div class="text-gray-400">width</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['STRUCTURE_LEN_MT_049']}}</div>
                    <div class="text-gray-400">length</div>
                </div>
                <div>
                    <div>{{parseInt(selectedBridge.properties['YEAR_BUILT_027'])}}</div>
                    <div class="text-gray-400"> year built</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['ROUTE_NUMBER_005D']}}</div>
                    <div class="text-gray-400"> Route</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['TRAFFIC_LANES_ON_028A']}}</div>
                    <div class="text-gray-400"> #Lanes</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['cluster']}}</div>
                    <div class="text-gray-400"> cluster id</div>
                </div>
            </div>

            <button class="bg-green-500 mx-2 p-2 text-xs rounded-md">
                <span @click="showApp()">View Details</span>
            </button>
            <button class="bg-green-500 mx-2 p-2 text-xs rounded-md">
                <span @click=""><a v-bind:href="url" target="_blank">Street View</a></span>
            </button>
        </div>
        
    </div>
</template>

<style>

.mapboxgl-popup-content {
    background: none;
    border-radius: 0;
    box-shadow: none;
}

</style>
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

const numberInput = ref(0);

const clickCallback = async (e) => {
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
            .addTo(mapStore.mapbox_instance);
}

onMounted(() => {
    let map_instance = mapStore.mapbox_instance

    if (map_instance.getSource("bridges")){
        map_instance.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color' : "#FFFF00",
                    'circle-radius': 4,
                    'circle-stroke-color':"#000000",
                    'circle-stroke-width':1
                }
          });
    }

    map_instance.on('click', 'bridges', clickCallback);

})

onUnmounted(() => {
    let map_instance = mapStore.mapbox_instance

    map_instance.off('click', 'bridges', clickCallback);

    if (map_instance.getLayer("bridges")) {
      map_instance.removeLayer("bridges");
    }
})

const showApp = () => {
    mapStore.isVisible = true;
}

const buttonAction = (properties) => {
    if (properties['inCluster'] == true) {
        return "Remove from Cluster"
    } else {
        return "Add to "
    }
}

</script>

<template>
    <div class="popup-content" v-if="selectedBridge != null" ref="popupContent">
        <div class="card w-[40rem] bg-white shadow-lg rounded-lg overflow-hidden">
            <span class="text-lg font-bold">
                <div class="flex gap-2">
                    <div>{{selectedBridge.properties['bridge_name']}}</div>
                    <button class="btn btn-warning btn-xs">
                        <span @click=""><a v-bind:href="url" target="_blank">Street View</a></span>
                    </button>
                </div> 
            </span>

            <div class="flex gap-2 py-4">
                <div>
                    <div>{{selectedBridge.properties['width_m']}}</div>
                    <div class="text-gray-400">width</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['length_m']}}</div>
                    <div class="text-gray-400">length</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['year_built']}}</div>
                    <div class="text-gray-400"> built</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['route_number']}}</div>
                    <div class="text-gray-400"> route#</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['lanes_on']}}</div>
                    <div class="text-gray-400"> lanes</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['state_code']}}</div>
                    <div class="text-gray-400"> state <code></code></div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['structure_kind']}}</div>
                    <div class="text-gray-400"> kind </div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['owner']}}</div>
                    <div class="text-gray-400"> owner <code></code></div>
                </div>
            </div>

            <div class="flex gap-2 py-4">
                <div>
                    <div>{{selectedBridge.properties['county_code']}}</div>
                    <div class="text-gray-400">county</div>
                </div>
                <div>
                    <div>{{(selectedBridge.properties['deck_condition']===undefined) ? "NA": selectedBridge.properties['deck_condition']}}</div>
                    <div class="text-gray-400">condition</div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['structure_type']}}</div>
                    <div class="text-gray-400"> struct type </div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['wearing_surface_type']}}</div>
                    <div class="text-gray-400"> surface </div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['average_daily_traffic']}}</div>
                    <div class="text-gray-400"> ADT </div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['route_type']}}</div>
                    <div class="text-gray-400"> route <code></code></div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['structure_type']}}</div>
                    <div class="text-gray-400"> type </div>
                </div>
                <div>
                    <div>{{selectedBridge.properties['id']}}</div>
                    <div class="text-gray-400"> pk <code></code></div>
                </div>
            </div>
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
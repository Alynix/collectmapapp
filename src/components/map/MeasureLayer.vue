<script setup>

import { onMounted, onUnmounted, ref, nextTick, watch} from 'vue';
import { useMapStore } from '../../stores/mapstore' 

import * as turf from '@turf/turf';

import mapboxgl from 'mapbox-gl';

const mapStore = useMapStore();

const distance = ref(0);
const popupContent = ref(null);

const useMeters = ref(true);
const unit = ref('m');

const popup = ref(null);

const isDragging = ref(false);
const draggedPointId = ref(null);

onMounted(()=>{
    let map_instance = mapStore.mapbox_instance

    mapStore.showDraw = false

    console.log("Measure Layer Mounted ")

    // measuring tool 

    // GeoJSON object to hold our measurement features
    const geojson = ref({
            'type': 'FeatureCollection',
            'features': []
        });

    // Used to draw a line between points
    const linestring = ref({
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': []
        }
    });

   

    map_instance.addSource('geojson', {
        'type': 'geojson',
        'data': geojson.value
    });

    // Add styles to the map
    map_instance.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'geojson',
        paint: {
            'circle-radius': 5,
            'circle-color': '#e00'
        },
        filter: ['in', '$type', 'Point']
    });
    map_instance.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'geojson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#e00',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });

    // Handle point click (start dragging)
    map_instance.on('mousedown', 'measure-points', (e) => {
        e.preventDefault();
        isDragging.value = true;
        console.log("Dragging");
        draggedPointId.value = e.features[0].properties.id;
    });

    map_instance.on('click', 'measure-points', (e) => {
        console.log("Clicked on a point!", e.features[0]);
    });



    map_instance.on('click', async (e) => {

        if (isDragging.value) return; // Prevent new points from being added while dragging

        const features = map_instance.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });

        // Remove the linestring from the group
        // so we can redraw it based on the points collection.
        if (geojson.value.features.length > 1) geojson.value.features.pop();

        // Clear the distance container to populate it with a new value.
        //distanceContainer.innerHTML = '';

        // If a feature was clicked, remove it from the map.
        if (features.length) {
            const id = features[0].properties.id;
            geojson.value.features = geojson.value.features.filter(
                (point) => point.properties.id !== id
            );
        } else {
            const point = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat]
                },
                'properties': {
                    'id': String(new Date().getTime())
                }
            };

            
            
            geojson.value.features.push(point);

            if(geojson.value.features.length > 2){
                geojson.value.features.shift();
            }
        }

        if (geojson.value.features.length > 1) {
            linestring.value.geometry.coordinates = geojson.value.features.map(
                (point) => point.geometry.coordinates
            );

            geojson.value.features.push(linestring.value);

            // Populate the distanceContainer with total distance
            //const value = document.createElement('pre');
            distance.value = turf.length(linestring.value) * 1000; // convert to meters

            distance.value = Math.round(distance.value * 100) / 100; // round to 2 decimal places

            // Need the dom update cycle to complete 
            // so that the popup is mounted and rendered
            await nextTick();

            popup.value = new mapboxgl.Popup({anchor: 'bottom-right'})
            .setLngLat(e.lngLat)
            .setDOMContent(
                popupContent.value
            )
            .addTo(map_instance);

            //value.textContent = `Total distance: ${distance.toLocaleString()}km`;
            //distanceContainer.appendChild(value);
        }

        

        map_instance.getSource('geojson').setData(geojson.value);
    });

    

    // Handle dragging
    map_instance.on('mousemove', (e) => {
        if (!isDragging.value || !draggedPointId.value) return;

        // Update the dragged point’s coordinates
        geojson.value.features = geojson.value.features.map(point => {
            if (point.properties.id === draggedPointId.value) {
                point.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
            }
            return point;
        });

        // Update line if there are two points
        if (geojson.value.features.length > 1) {
            linestring.value.geometry.coordinates = geojson.value.features.map(
                (point) => point.geometry.coordinates
            );
        }

        map_instance.getSource('geojson').setData(geojson.value);
    });

    // Handle mouse release (stop dragging)
    map_instance.on('mouseup', () => {
        isDragging.value = false;
        draggedPointId.value = null;
    });



   

    


})

watch(useMeters,(newVal,oldVal)=>{
    let map_instance = mapStore.mapbox_instance

    if (newVal){

        // convert feet to meters, round to 2 decimal places
        unit.value = 'm';
        distance.value = Math.round(distance.value / 3.28084 * 100) / 100

    } else {

        // convert meters to feet, round to 2 decimal places
        unit.value = 'ft';
        distance.value = Math.round(distance.value * 3.28084 * 100) / 100
    }

});

onUnmounted(()=>{
    let map_instance = mapStore.mapbox_instance

    console.log("Measure Layer Unmounted ")

    if (popup.value) {
        popup.value.remove();
    }

    // remove the layers and sources

    if (map_instance.getLayer("measure-points")) {
        map_instance.removeLayer("measure-points");
    }

    if (map_instance.getLayer("measure-lines")) {
        map_instance.removeLayer("measure-lines");
    }

    if (map_instance.getSource("geojson")) {
        map_instance.removeSource("geojson");
    }

    mapStore.showDraw = true

})

</script>

<template>
    <div class="popup-content" v-if="distance>0" ref="popupContent">
        <div class="p-3 w-auto bg-gray-900 text-white">
            <button class="btn btn-error btn-xs text-xs" @click="useMeters = !useMeters">
                <span class="text-lg font-bold">{{ distance }} {{ unit }}</span>
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
<script setup>

import { onMounted, onUnmounted, ref} from 'vue';
import { useMapStore } from '../../stores/mapstore' 

import * as turf from '@turf/turf';

const mapStore = useMapStore();

onMounted(()=>{
    let draw_instance = mapStore.mapboxdraw_instance

    mapStore.showMeasure = false

    let data = mapStore.draw_data

    if (data){
        draw_instance.add(data)
    }
    
    

})

onUnmounted(()=>{
    let draw_instance = mapStore.mapboxdraw_instance

    let data = draw_instance.getAll()

    mapStore.draw_data = data
    
    draw_instance.deleteAll();

})

</script>

<template>


</template>
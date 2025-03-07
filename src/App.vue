<script setup>
import { RouterLink, RouterView } from 'vue-router'

import MyMap from './components/map/Map.vue'

import DrawLayer from './components/map/DrawLayer.vue'
import MeasureLayer from './components/map/MeasureLayer.vue'

import BridgesLayer from './components/map/BridgesLayer.vue'
import ClustersLayer from './components/map/ClustersLayer.vue'

import CountyLayer from './components/map/USCounties.vue'

import {useMapStore } from './stores/mapstore'


const mapStore=useMapStore();

</script>

<template>
   <main>
    <MyMap>
  
    </MyMap>

    <CountyLayer v-if="mapStore.map_mounted && mapStore.showCounties"></CountyLayer>
    <BridgesLayer v-if="mapStore.map_mounted && mapStore.showBridges"></BridgesLayer>
    <ClustersLayer v-if="mapStore.map_mounted && mapStore.showClusters"></ClustersLayer>

    <DrawLayer v-if="mapStore.map_mounted && mapStore.showDraw"></DrawLayer>
    <MeasureLayer v-if="mapStore.map_mounted && mapStore.showMeasure"></MeasureLayer>
    

  </main>
</template>

<style scoped>
 
</style>

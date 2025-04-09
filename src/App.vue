<script setup>
import { RouterLink, RouterView } from 'vue-router'

import MyMap from './components/map/Map.vue'

import DrawLayer from './components/map/DrawLayer.vue'
import MeasureLayer from './components/map/MeasureLayer.vue'

import BridgesLayer from './components/map/BridgesLayer.vue'
import ClustersLayer from './components/map/ClustersLayer.vue'

import CountyLayer from './components/map/USCounties.vue'

import {useMapStore } from './stores/mapstore'

import BridgesListPane from './components/map/BridgesListPane.vue'
import MacroplansListPane from './components/map/MacroplansListPane.vue'
import ClustersListPane from './components/map/ClustersListPane.vue'


const mapStore=useMapStore();

</script>

<template>
   <main>
    <MyMap>
      <template #left-sidebar>
        <BridgesListPane v-if="mapStore.isVisible"></BridgesListPane>
        <MacroplansListPane v-if="!mapStore.isVisible & mapStore.showPlans"></MacroplansListPane>
        <ClustersListPane v-if="!mapStore.isVisible & mapStore.showClusterTable"></ClustersListPane>
      </template>
  
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

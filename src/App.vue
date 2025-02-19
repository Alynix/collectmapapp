<script setup>
import { RouterLink, RouterView } from 'vue-router'

import MyMap from './components/map/Map.vue'

import MacroPlansListPane from './components/map/MacroPlansListPane.vue'

import DrawLayer from './components/map/DrawLayer.vue'

import BridgesLayer from './components/map/BridgesLayer.vue'
import ClustersLayer from './components/map/ClustersLayer.vue'

import CountyLayer from './components/map/USCounties.vue'

import {useMapStore } from './stores/mapstore'


const mapStore=useMapStore();

</script>

<template>
   <main>
    <MyMap>
      <template #left-sidebar>
        <MacroPlansListPane/>
      </template>
  
    </MyMap>

    <CountyLayer v-if="mapStore.map_mounted && mapStore.showCounties"></CountyLayer>
    <DrawLayer v-if="mapStore.map_mounted && mapStore.showDraw"></DrawLayer>
    <BridgesLayer v-if="mapStore.map_mounted && mapStore.showBridges"></BridgesLayer>
    <ClustersLayer v-if="mapStore.map_mounted && mapStore.showClusters"></ClustersLayer>
    

  </main>
</template>

<style scoped>
 
</style>

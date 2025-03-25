<script setup>
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useMapStore } from '@/stores/mapstore';
import { ref } from 'vue';

import { union } from '@turf/turf';

const mapStore = useMapStore();

onMounted(async () => {
    await mapStore.fetchPlanClusters();

    

});

onUnmounted(() => {
    
});

// Function to zoom to coordinates
function zoomToCoordinates(lng, lat, zoomLevel=15) {
    mapStore.mapbox_instance.flyTo({
      center: [lng, lat],
      zoom: zoomLevel
    });
}

const clusterRowClick = (row) => {

    mapStore.showClusterTable = false;

    zoomToCoordinates(row.longitude, row.latitude);
}

</script>


<template>
  <div class="join join-horizontal gap-2 p-4 bg-base-200">
      <h2 class="text-lg font-bold">{{mapStore.planClusterRows.length}} Collection Clusters for Plan {{ mapStore.selectedPlan.id }}</h2>
  </div> 
    <EasyDataTable
      :headers="mapStore.clusterColDefs"
      :items="mapStore.planClusterRows"
      :pagination="true"
      :rows-per-page="10"
      @click-row="clusterRowClick"
      alternating
    />

</template>





<style scoped>


</style>
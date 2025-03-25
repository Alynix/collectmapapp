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

async function remakeCluster(new_bridge_names){

const plan_id = mapStore.selectedPlan.id;

const numberInput = ref(0);

const cluster_params = {
  bridge_names: new_bridge_names,
  mode: 1,
  Kclusters: 1,
  saveClusters: true
}

await mapStore.createPlanClusters(plan_id,cluster_params);

mapStore.drawPolygon = mapStore.selectedPlan.geometry;

mapStore.displayPlanPolygon();

}

const mergeTwoClusters = () => {
    
    //loop mapStore.planClustersPayload to find cluster which contains the bridge
    const cluster1 = mapStore.selectedClusters[0]
    const cluster2 = mapStore.selectedClusters[1]
    
    const filtered_bridge_names = cluster1.bridge_names.concat(cluster2.bridge_names)

    remakeCluster(filtered_bridge_names)
}

</script>


<template>
  <div class="join join-horizontal gap-2 p-4 bg-base-200">
      <h2 class="text-lg font-bold">{{mapStore.planClusterRows.length}} Collection Clusters for Plan {{ mapStore.selectedPlan.id }}</h2>
      <button :class="['btn', mapStore.selectedClusters.length==2 ? 'btn-secondary' : 'btn-disabled','btn-xs']" @click="mergeTwoClusters">Merge Selected Clusters</button>
  </div> 
    <EasyDataTable
      :headers="mapStore.clusterColDefs"
      :items="mapStore.planClusterRows"
      :pagination="true"
      :rows-per-page="10"
      v-model:items-selected="mapStore.selectedClusters"
      @click-row="clusterRowClick"
      alternating
    />

</template>





<style scoped>


</style>
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useMapStore } from '@/stores/mapstore';
import { ref } from 'vue';

import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component

import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);


const mapStore = useMapStore();

onMounted(async () => {
    //await mapStore.fetchMacroPlans();
    //console.log(mapStore.macroPlans);
    console.log('BridgeLIST Mounted')
});

onUnmounted(() => {
  //mapStore.macroPlans = [];
});

</script>


<template>
    <!-- The AG Grid component -->
     <div class="ag-theme-alpine w-full" style="height: 100px;">
        <ag-grid-vue
        :rowData="mapStore.localBridges"
        :columnDefs="mapStore.bridgeColDefs"
        style="height: 500px"
        >
        </ag-grid-vue>
     </div>
    
</template>




<style scoped>

.ag-theme-alpine, .ag-theme-balham {
    --ag-font-size: 10px; /* Works in some cases */
}

</style>
<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useMapStore } from '@/stores/mapstore';
import { ref } from 'vue';


import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import EasyDataTable from 'vue3-easy-data-table';


const mapStore = useMapStore();

onMounted(async () => {
    //await mapStore.fetchMacroPlans();
    //console.log(mapStore.macroPlans);
    console.log('BridgeLIST Mounted')
});

onUnmounted(() => {
  //mapStore.macroPlans = [];
});

const headers = [
      { text: "Name", value: "name" },
      { text: "Height (cm)", value: "height", sortable: true },
      { text: "Weight (kg)", value: "weight", sortable: true },
      { text: "Age", value: "age", sortable: true }
    ];

const items = [
    { "name": "Curry", "height": 178, "weight": 77, "age": 20 },
    { "name": "James", "height": 180, "weight": 75, "age": 21 },
    { "name": "Jordan", "height": 181, "weight": 73, "age": 22 }
];

const showDeckConditionFilter = ref(true);

const deckConditionCriteria = ref('Good');

const filterOptions = computed(() => {
  const filterOptionsArray = [];
  if (deckConditionCriteria.value !== 'all') {
    filterOptionsArray.push({
      field: 'deck_condition',
      comparison: '=',
      criteria: deckConditionCriteria.value,
    });
  }
  return filterOptionsArray;
});

</script>


<template>
    <EasyDataTable
      :headers="mapStore.bridgeColDefs"
      :items="mapStore.localBridges"
      :filter-options="filterOptions"
    >
    
    <template #header-deck_condition="header">
      <div class="filter-column">
        <button class="btn btn-neutral btn-xs" @click="showDeckConditionFilter=!showDeckConditionFilter">
            {{ header.text }}
        </button>
        <div class="filter-menu filter-deck_condition-menu" v-if="showDeckConditionFilter">
          <select
            class="deck_condiction-selector"
            v-model="deckConditionCriteria"
            name="deck_condition"
          >
            <option value="Not Applicable">
                Not Applicable
            </option>
            <option value="Failed">
                Failed
            </option>
            <option value="Imminent Failure">
                Imminent Failure
            </option>
            <option value="Critical">
                Critical
            </option>
            <option value="Serious">
                Serious
            </option>
            <option value="Poor">
                Poor
            </option>
            <option value="Fair">
                Fair
            </option>
            <option value="Satisfactory">
                Satisfactory
            </option>
            <option value="Good">
                Good
            </option>
            <option value="Very Good">
                Very Good
            </option>
            <option value="Excellent">
                Excellent
            </option>
            <option value="all">
                All
            </option>

          </select>
        </div>
      </div>
    </template>
    
    </EasyDataTable>
</template>




<style scoped>

.ag-theme-alpine, .ag-theme-balham {
    --ag-font-size: 10px; /* Works in some cases */
}

</style>
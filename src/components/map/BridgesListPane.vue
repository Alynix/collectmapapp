<script setup>
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useMapStore } from '@/stores/mapstore';
import { ref } from 'vue';

import { union } from '@turf/turf';

const mapStore = useMapStore();

onMounted(async () => {
    //await mapStore.fetchMacroPlans();

    console.log('BridgeListPane mounted');
    console.log(filterOptions.value);

});

onUnmounted(() => {
  //mapStore.macroPlans = [];
});

const showDeckConditionFilter = ref(false);
const showLanesOnFilter = ref(false);
const showStructureKindFilter = ref(false);
const showStructureTypeFilter = ref(false);
const showRouteTypeFilter = ref(false);
const showDeckStructureTypeFilter = ref(false);
const showWearingSurfaceTypeFilter = ref(false);
const showOwnerFilter = ref(false);
const showLengthFilter = ref(false);
const showWidthFilter = ref(false);
const showAverageDailyTrafficFilter = ref(false);

const filterOptions = computed(() => {
  const filterOptionsArray = [];

  if (!mapStore.uniqueValues) return filterOptionsArray;
  
  filterOptionsArray.push({
    field: 'deck_condition',
    comparison: 'in',
    criteria: mapStore.uniqueValues['deck_condition'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'lanes_on',
    comparison: 'in',
    criteria: mapStore.uniqueValues['lanes_on'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'structure_type',
    comparison: 'in',
    criteria: mapStore.uniqueValues['structure_type'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'structure_kind',
    comparison: 'in',
    criteria: mapStore.uniqueValues['structure_kind'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'route_type',
    comparison: 'in',
    criteria: mapStore.uniqueValues['route_type'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'deck_structure_type',
    comparison: 'in',
    criteria: mapStore.uniqueValues['deck_structure_type'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'wearing_surface_type',
    comparison: 'in',
    criteria: mapStore.uniqueValues['wearing_surface_type'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'owner',
    comparison: 'in',
    criteria: mapStore.uniqueValues['owner'].filter(option => option.selected).map(option => option.value)
  });

  filterOptionsArray.push({
    field: 'length_m',
    comparison: 'between',
    criteria: mapStore.lengthCriteria,
  });

  filterOptionsArray.push({
    field: 'width_m',
    comparison: 'between',
    criteria: mapStore.widthCriteria,
  });

  filterOptionsArray.push({
    field: 'average_daily_traffic',
    comparison: 'between',
    criteria: mapStore.trafficCriteria,
  });
 
  return filterOptionsArray;
});

</script>


<template>
  <div class="p-4 bg-base-200">
    <h2 class="text-lg font-bold">{{mapStore.localBridges.length}} Bridges, {{mapStore.selectedBridges.length}} selected</h2>
    </div>  
    <EasyDataTable
      :headers="mapStore.bridgeColDefs"
      :items="mapStore.localBridges"
      :filter-options="filterOptions"
      :pagination="true"
      :rows-per-page="10"
      v-model:items-selected="mapStore.selectedBridges"
      alternating 
    >
    <template #header-length_m="header">
      <div class="filter-column">
        <button class="btn btn-primary btn-xs filter-icon" @click.stop="showLengthFilter = !showLengthFilter">
          {{ header.text }}
        </button>
        <div class="filter-menu filter-length_m-menu" v-if="showLengthFilter">
          <div class="flex items-center gap-2">
            <input type="number" v-model="mapStore.lengthCriteria[0]" class="input input-bordered input-xs w-16" />
            <input type="number" v-model="mapStore.lengthCriteria[1]" class="input input-bordered input-xs w-16" />
          </div>
        </div>
      </div>
    </template>
    <template #header-width_m="header">
      <div class="filter-column">
        <button class="btn btn-primary btn-xs filter-icon" @click.stop="showWidthFilter = !showWidthFilter">
          {{ header.text }}
        </button>
        <div class="filter-menu filter-width_m-menu" v-if="showWidthFilter">
          <div class="flex items-center gap-2">
            <input type="number" v-model="mapStore.widthCriteria[0]" class="input input-bordered input-xs w-16" />
            <input type="number" v-model="mapStore.widthCriteria[1]" class="input input-bordered input-xs w-16" />
          </div>
        </div>
      </div>
    </template>
    <template #header-average_daily_traffic="header">
      <div class="filter-column">
        <button class="btn btn-primary btn-xs filter-icon" @click.stop="showAverageDailyTrafficFilter = !showAverageDailyTrafficFilter">
          {{ header.text }}
        </button>
        <div class="filter-menu filter-average_daily_traffic-menu" v-if="showAverageDailyTrafficFilter">
          <div class="flex items-center gap-2">
            <input type="number" v-model="mapStore.trafficCriteria[0]" class="input input-bordered input-xs w-16" />
            <input type="number" v-model="mapStore.trafficCriteria[1]" class="input input-bordered input-xs w-16" />
          </div>
        </div>
      </div>
    </template>
    <template #header-route_type="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-route_type-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showRouteTypeFilter = !showRouteTypeFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showRouteTypeFilter">
              <li v-for="option in mapStore.uniqueValues['route_type']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-deck_condition="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-deck_condition-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showDeckConditionFilter = !showDeckConditionFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showDeckConditionFilter">
              <li v-for="option in mapStore.uniqueValues['deck_condition']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-lanes_on="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-lanes_on-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showLanesOnFilter = !showLanesOnFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showLanesOnFilter">
              <li v-for="option in mapStore.uniqueValues['lanes_on']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-structure_type="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-structure_type-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showStructureTypeFilter = !showStructureTypeFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showStructureTypeFilter">
              <li v-for="option in mapStore.uniqueValues['structure_type']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-structure_kind="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-structure_kind-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showStructureKindFilter = !showStructureKindFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showStructureKindFilter">
              <li v-for="option in mapStore.uniqueValues['structure_kind']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-deck_structure_type="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-deck_structure_type-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showDeckStructureTypeFilter = !showDeckStructureTypeFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showDeckStructureTypeFilter">
              <li v-for="option in mapStore.uniqueValues['deck_structure_type']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-wearing_surface_type="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-wearing_surface_type-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showWearingSurfaceTypeFilter = !showWearingSurfaceTypeFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showWearingSurfaceTypeFilter">
              <li v-for="option in mapStore.uniqueValues['wearing_surface_type']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    <template #header-owner="header">
      <div class="filter-column">
        
        <div class="filter-menu filter-owner-menu">
          <div tabindex="0" role="button" class="btn btn-warning btn-xs " @click="showOwnerFilter = !showOwnerFilter">
              {{ header.text }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs" v-if="showOwnerFilter">
              <li v-for="option in mapStore.uniqueValues['owner']" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.value }}</span>
                </label>
              </li>
            </ul>
        </div>
      </div>
    </template>
    
    </EasyDataTable>
</template>




<style scoped>


</style>
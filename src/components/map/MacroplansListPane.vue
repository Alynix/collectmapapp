<script setup>
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useMapStore } from '@/stores/mapstore';
import { ref } from 'vue';

import { union } from '@turf/turf';

const mapStore = useMapStore();

// Ref to control modal visibility
const isModalOpen = ref(false);

// Form data
const newPlan = ref({
  name: '',
  description: '',
  geom: null,
});

// Function to handle form submission
const createPlan = () => {

  if(mapStore.drawPolygon){
    newPlan.value.geom = mapStore.drawPolygon.coordinates[0];

    if (newPlan.value.name && newPlan.value.description) {
        mapStore.addMacroPlan(newPlan.value); // Assuming `addMacroPlan` exists in the store
        console.log(newPlan.value.name);
        console.log(newPlan.value.description);
        console.log(newPlan.value.geom);
        newPlan.value.name = '';
        newPlan.value.description = '';
        isModalOpen.value = false; // Close the modal
    } else {
      alert('Please fill out all fields.');
    }

  } else {
    alert('Please draw a polygon on the map.');
    return;
  }
  
};



const clearLayer = (tag) => {
    if (mapStore.mapbox_instance.getLayer(tag)) {
      mapStore.mapbox_instance.removeLayer(tag);
    }

    if (mapStore.mapbox_instance.getSource(tag)) {
      mapStore.mapbox_instance.removeSource(tag);
    }
}


async function displayPlanPolygon() {

if(mapStore.selectedPlan){
  clearLayer("plan")

  mapStore.mapbox_instance.addSource("plan", {
  type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
  data: mapStore.selectedPlan.geometry

      });

  mapStore.mapbox_instance.addLayer({
      id: "plan",
      type: 'fill',
      source: "plan",
      paint: {
          'fill-color' : "#87CEEB",
          'fill-opacity': 0.3,
          'fill-outline-color': "#000000"
      }
  });
}



}

onMounted(async () => {
    await mapStore.fetchMacroPlans();

    

});

onUnmounted(() => {
    mapStore.macroPlans = [];
});


const filterOptions = computed(() => {
  const filterOptionsArray = []; 

  if (!mapStore.selectedPlan) {
    return filterOptionsArray;
  }

  //filter on selectedPlan ID 
  filterOptionsArray.push({
    "field": "id",
    "comparison": "==",
    "criteria": mapStore.selectedPlan.id
  })

  return filterOptionsArray;
});

const showPlan = (plan) => {
  if(!mapStore.selectedPlan){
    mapStore.selectedPlan = plan;

    mapStore.drawPolygon = plan.geometry;

    displayPlanPolygon();

    mapStore.showPlans = false;


  } else {
    mapStore.selectedPlan = null;
  }
  
  console.log(mapStore.selectedPlan);
};

</script>


<template>
  <div class="join join-horizontal gap-2 p-4 bg-base-200">
      <h2 class="text-lg font-bold">Macroplans</h2>
      <button class="btn btn-primary btn-xs" @click="isModalOpen = true">New Plan</button>
  </div> 
    <EasyDataTable
      :headers="mapStore.planColDefs"
      :items="mapStore.macroPlans"
      :filter-options="filterOptions"
      :pagination="true"
      :rows-per-page="10"
      @click-row="showPlan"
      alternating
    />

  <!-- Modal -->
  <div v-if="isModalOpen" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Create New Plan</h3>
      <form @submit.prevent="createPlan">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Plan Name</span>
          </label>
          <input
            type="text"
            v-model="newPlan.name"
            class="input input-bordered"
            placeholder="Enter plan name"
          />
        </div>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="newPlan.description"
            class="textarea textarea-bordered"
            placeholder="Enter plan description"
          ></textarea>
        </div>
        <div class="modal-action">
          <button type="submit" class="btn btn-primary">Create Plan</button>
          <button type="button" class="btn" @click="isModalOpen = false">Cancel</button>
        </div>
      </form>
    </div>
  </div>

</template>





<style scoped>


</style>
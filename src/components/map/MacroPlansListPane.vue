<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useMapStore } from '@/stores/mapstore';
import { ref } from 'vue';


const mapStore = useMapStore();

onMounted(async () => {
    await mapStore.fetchMacroPlans();
    console.log(mapStore.macroPlans);
});

onUnmounted(() => {
  mapStore.macroPlans = [];
});

</script>


<template>
    <div id="mp-list" class="layer-pane w-100 text-white">
        <div id="table-wrapper" class="bg-gray-900">
            <!--place holder for table-->
            <table >
                <thead class="text-white text-s">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody class="text-white text-xs"> 
                    <tr v-for="plan in mapStore.macroPlans">
                        <td>{{plan.id}}</td>
                        <td>{{plan.name}}</td>
                        <td>{{plan.description}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>




<style scoped>

</style>
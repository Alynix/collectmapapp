import { defineStore } from "pinia";
import { ref, markRaw } from "vue";
import { useLocalStorage } from "@vueuse/core"

import deckerAPI from "@/api/deckerAPI";

export const useMapStore = defineStore("mapstore",() => {

    const mapbox_instance = ref({});
    const map_mounted = ref(false);

    const mapCenter = useLocalStorage('map.center', [-94.765834, 38.926551]);
    const mapZoom = useLocalStorage('map.zoom', 16);

    const showDraw = ref(true);
    const showMeasure = ref(false);

    const showPlans = ref(true);

    const showBridges = ref(true);
    const showClusters = ref(true);

    const showCounties = ref(false);

    const calcArea = ref(0)

    const mapboxdraw_instance = ref({})

    const draw_data = ref(null)

    const drawPolyon = ref(null)

    const isVisible = ref(false) // toggle embbedded Superblocks app visibility 

    const sbAPP = ref(null) // Superblocks app instance

    const macroPlans = ref([])

    const selectedPlan = ref(null)

    const planPayload = ref({})

    const fetchMacroPlans = async () => {
        let response = await deckerAPI.get_macroplans();
        macroPlans.value = response.data.features.map((feature) => {
            const row = feature.properties;

            return {
                id: row.id,
                name: row.name,
                description: row.description,
                cluster_count: row.cluster_count,
                geometry: feature.geometry
            }
        });

        planPayload.value = response.data;
    }

    const addMacroPlan = async (data) => {
        let response = await deckerAPI.create_macroplan(data);
        fetchMacroPlans();
    }

    const planColDefs = ref([
        { value: "id", text: "ID" },
        { value: "name", text: "Name" },
        { value: "description", text: "Description" },
        { value: "cluster_count", text: "Cluster Count" },
    ]);

    const localBridges = ref([])

    const selectedBridges = ref([])

    const bridgeColDefs = ref([
        { value: "bridge_name", text: "Bridge Name" },
        { value: "route_type", text: "Route Type" },
        { value: "route_number", text: "Route Number" },
        { value: "length_m", text: "Length (m)" , sortable: true},
        { value: "width_m", text: "Width (m)" , sortable: true},
        { value: "deck_condition", text: "Deck Condition" },
        { value: "lanes_on", text: "Lanes On" },
        { value: "year_built", text: "Year Built" },
        { value: "year_inspected", text: "Year Inspected" },
        { value: "structure_type", text: "Structure Type" },
        { value: "structure_kind", text: "Structure Kind" },
        { value: "deck_structure_type", text: "Deck Structure Type" },
        { value: "wearing_surface_type", text: "Wearing Surface Type" },
        { value: "owner", text: "Owner" },
        { value: "average_daily_traffic", text: "Average Daily Traffic" ,sortable: true},
        { value: "year_adt", text: "Year ADT" },
        { value: "features_description", text: "Features Description" },
        { value: "source_name", text: "Source Name" }
    ]);
    

    const bridgePayload = ref({})

    const uniqueValues = ref(null)

    const lengthCriteria = ref([0,10000]);
    const widthCriteria = ref([0,10000]);
    const trafficCriteria = ref([0,1000000]);

    const categories = ref(['deck_condition', 'lanes_on', 'route_type', 'structure_type', 'structure_kind', 'deck_structure_type', 'wearing_surface_type', 'owner'])

    const fetchBridges = async (polygon) => {

        let response = await deckerAPI.get_bridges(polygon);

        uniqueValues.value = {};

        localBridges.value = response.data.features.map((feature) => {
            const row = feature.properties;

            return {
                bridge_name: row.bridge_name,
                route_type: row.route_type,
                route_number: row.route_number,
                length_m: row.length_m,
                width_m: row.width_m,
                deck_condition: row.deck_condition,
                lanes_on: row.lanes_on,
                year_built: row.year_built,
                year_inspected: row.year_inspected,
                structure_type: row.structure_type,
                structure_kind: row.structure_kind,
                deck_structure_type: row.deck_structure_type,
                wearing_surface_type: row.wearing_surface_type,
                owner: row.owner,
                average_daily_traffic: row.average_daily_traffic,
                year_adt: row.year_adt,
                features_description: row.features_description,
                source_name: row.source_name,
            };
        });

        response.data.features.forEach((feature) => {
            const row = feature.properties;

            Object.keys(row).filter((key) => categories.value.includes(key)).forEach((key) => {
                if (!uniqueValues.value[key]) {
                    uniqueValues.value[key] = new Set();
                }

                uniqueValues.value[key].add(row[key]);
            });

        });

        //convert sets to arrays
        Object.keys(uniqueValues.value).forEach((key) => {
            uniqueValues.value[key] = Array.from(uniqueValues.value[key]);
        }
        );

        // convert each array entry to form {id: , value: , selected: false}
        Object.keys(uniqueValues.value).forEach((key) => {
            uniqueValues.value[key] = uniqueValues.value[key].map((value, index) => {
                return {
                    id: index,
                    value: value,
                    selected: true
                }
            });
        });

        // for map geojson bridge layer 
        bridgePayload.value = response.data;

    }

    const planClustersPayload = ref([])

    const fetchPlanClusters = async (plan_id) => {

        let response = await deckerAPI.get_planclusters(plan_id);

        planClustersPayload.value = response.data

    }

    const createPlanClusters = async (plan_id, data) => {

        let response = await deckerAPI.cluster_bridges(plan_id, data);

        console.log('clustering response', response.data)

        planClustersPayload.value = response.data

    }


    return { mapbox_instance,
             map_mounted,
             mapCenter,
             mapZoom,
             showBridges,
             showClusters,
             showDraw,
             showMeasure,
             showCounties,
             calcArea,
             mapboxdraw_instance,
             draw_data,
             isVisible,
             localBridges,
             selectedBridges,
             bridgePayload,
             bridgeColDefs,
             uniqueValues,
             lengthCriteria,
             widthCriteria,
             trafficCriteria,
             macroPlans,
             planColDefs,
             planClustersPayload,
             fetchMacroPlans,
             fetchBridges,
             addMacroPlan,
             fetchPlanClusters,
             createPlanClusters}

});
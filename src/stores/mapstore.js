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

    const showBridges = ref(true);
    const showClusters = ref(true);

    const showCounties = ref(false);

    const calcArea = ref(0)

    const mapboxdraw_instance = ref({})

    const draw_data = ref(null)

    const isVisible = ref(false) // toggle embbedded Superblocks app visibility 

    const sbAPP = ref(null) // Superblocks app instance

    const macroPlans = ref([])

    const fetchMacroPlans = async () => {
        let response = await deckerAPI.get_macroplans();
        macroPlans.value = response.data.features.map((feature) => {
            const row = feature.properties;

            return {
                id: row.id,
                name: row.name,
                description: row.description,
            }
        });
    }

    const localBridges = ref([])

    const bridgeColDefs = ref([
        { value: "bridge_name", text: "Bridge Name" },
        { value: "state_name", text: "State Name" },
        { value: "state_code", text: "State Code" },
        { value: "structure_number", text: "Structure Number" },
        { value: "county_code", text: "County Code" },
        { value: "route_type", text: "Route Type" },
        { value: "route_number", text: "Route Number" },
        { value: "latitude", text: "Latitude" },
        { value: "longitude", text: "Longitude" },
        { value: "length_m", text: "Length (m)" },
        { value: "width_m", text: "Width (m)" },
        { value: "deck_condition", text: "Deck Condition" },
        { value: "lanes_on", text: "Lanes On" },
        { value: "year_built", text: "Year Built" },
        { value: "year_inspected", text: "Year Inspected" },
        { value: "structure_type", text: "Structure Type" },
        { value: "structure_kind", text: "Structure Kind" },
        { value: "deck_structure_type", text: "Deck Structure Type" },
        { value: "wearing_surface_type", text: "Wearing Surface Type" },
        { value: "owner", text: "Owner" },
        { value: "average_daily_traffic", text: "Average Daily Traffic" },
        { value: "year_adt", text: "Year ADT" },
        { value: "features_description", text: "Features Description" },
        { value: "source_name", text: "Source Name" }
    ]);
    

    const bridgePayload = ref({})

    const fetchBridges = async (polygon) => {

        let response = await deckerAPI.get_bridges(polygon);

        localBridges.value = response.data.features.map((feature) => {
            const row = feature.properties;

            return {
                bridge_name: row.bridge_name ?? "NULL",
                state_name: row.state_name ?? "NULL",
                state_code: row.state_code,
                structure_number: row.structure_number,
                county_code: row.county_code ?? "NULL",
                route_type: row.route_type ?? "NULL",
                route_number: row.route_number,
                latitude: row.latitude,
                longitude: row.longitude,
                length_m: row.length_m,
                width_m: row.width_m,
                deck_condition: row.deck_condition ?? "NULL",
                lanes_on: row.lanes_on,
                year_built: row.year_built ?? "NULL",
                year_inspected: row.year_inspected ?? "NULL",
                structure_type: row.structure_type ?? "NULL",
                structure_kind: row.structure_kind ?? "NULL",
                deck_structure_type: row.deck_structure_type ?? "NULL",
                wearing_surface_type: row.wearing_surface_type ?? "NULL",
                owner: row.owner ?? "NULL",
                average_daily_traffic: row.average_daily_traffic ?? "NULL",
                year_adt: row.year_adt ?? "NULL",
                features_description: row.features_description ?? "NULL",
                source_name: row.source_name ?? "NULL",
            };
        });

        bridgePayload.value = response.data;

    }


    return { mapbox_instance,map_mounted,mapCenter,mapZoom,showBridges,showClusters,showDraw,showMeasure,showCounties,calcArea,mapboxdraw_instance,draw_data,isVisible,localBridges,bridgePayload,bridgeColDefs,macroPlans,fetchMacroPlans,fetchBridges}

});
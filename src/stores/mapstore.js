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
        { field: "bridge_name", headerName: "Bridge Name" },
        { field: "state_name", headerName: "State Name" },
        { field: "state_code", headerName: "State Code", width: 100 },
        { field: "structure_number", headerName: "Structure Number", width: 150 },
        { field: "county_code", headerName: "County Code", width: 120 },
        { field: "route_type", headerName: "Route Type" },
        { field: "route_number", headerName: "Route Number", width: 120 },
        { field: "latitude", headerName: "Latitude", width: 120 },
        { field: "longitude", headerName: "Longitude", width: 120 },
        { field: "length_m", headerName: "Length (m)", width: 120 },
        { field: "width_m", headerName: "Width (m)", width: 120 },
        { field: "deck_condition", headerName: "Deck Condition", width: 150 },
        { field: "lanes_on", headerName: "Lanes On", width: 100 },
        { field: "year_built", headerName: "Year Built", width: 120 },
        { field: "year_inspected", headerName: "Year Inspected", width: 150 },
        { field: "structure_type", headerName: "Structure Type" },
        { field: "structure_kind", headerName: "Structure Kind" },
        { field: "deck_structure_type", headerName: "Deck Structure Type" },
        { field: "wearing_surface_type", headerName: "Wearing Surface Type" },
        { field: "owner", headerName: "Owner" },
        { field: "average_daily_traffic", headerName: "Average Daily Traffic", width: 200 },
        { field: "year_adt", headerName: "Year ADT", width: 120 },
        { field: "features_description", headerName: "Features Description", width: 300 },
        { field: "source_name", headerName: "Source Name" },
    ]);

    const bridgePayload = ref({})

    const fetchBridges = async (polygon) => {

        let response = await deckerAPI.get_bridges(polygon);

        localBridges.value = response.data.features.map((feature) => {
            const row = feature.properties;

            return {
                id: row.id,
                bridge_name: row.bridge_name ?? "NULL",
                geometry: row.geometry ?? "NULL",
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
import { defineStore } from "pinia";
import { ref, markRaw } from "vue";
import { useLocalStorage } from "@vueuse/core"

export const useMapStore = defineStore("mapstore",() => {

    const mapbox_instance = ref({});
    const map_mounted = ref(false);

    const mapCenter = useLocalStorage('map.center', [-94.765834, 38.926551]);
    const mapZoom = useLocalStorage('map.zoom', 16);

    const showDraw = ref(true);

    const showBridges = ref(true);
    const showClusters = ref(true);

    const showCounties = ref(false);

    const calcArea = ref(0)

    const mapboxdraw_instance = ref({})

    const draw_data = ref(null)

    const isVisible = ref(false) // toggle embbedded Superblocks app visibility 

    return { mapbox_instance,map_mounted,mapCenter,mapZoom,showBridges,showClusters,showDraw,showCounties,calcArea,mapboxdraw_instance,draw_data}

});
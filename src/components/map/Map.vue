<template>

    <div class="navbar bg-base-100 shadow-sm">
        <div class="flex-1 gap-2">
          <a class="bg-ghost text-xl">Bridge Collection Clusters</a>

          <button class="btn btn-primary btn-xs" @click="resetSelectedPlan"> Macroplans </button>

          <h2>{{ mapStore.selectedPlan ? mapStore.selectedPlan.id + "-" + mapStore.selectedPlan.name : "Select A Plan" }}</h2>

          <button class="btn btn-primary btn-xs"@click="mapStore.isVisible = !mapStore.isVisible"> Bridge Selection Tool </button>

          <button :class="['btn', mapStore.selectedBridges.length>0 && mapStore.selectedPlan ? 'btn-error' : 'btn-disabled','btn-xs']" @click="createPlanClusters"> Create Plan Clusters </button> 


        </div>
        <div class="flex gap-2">

          <button :class="['btn', mapStore.showMeasure ? 'btn-warning' : 'btn-error','btn-xs']" @click="mapStore.showMeasure = !mapStore.showMeasure"> <span v-show="!mapStore.showMeasure">Show</span> <span v-show="mapStore.showMeasure">Hide</span> Measure Tool </button>

          <button :class="['btn', showSchedule ? 'btn-warning' : 'btn-success','btn-xs']" @click="showSchedule = !showSchedule"> <span v-show="!showSchedule">Show</span> <span v-show="showSchedule">Hide</span> Esimator </button>
          
          <button :class="['btn', mapStore.showBridges ? 'btn-warning' : 'btn-success','btn-xs']" @click="mapStore.showBridges = !mapStore.showBridges"> <span v-show="!mapStore.showBridges">Show</span> <span v-show="mapStore.showBridges">Hide</span> Bridges </button>

          <button :class="['btn', mapStore.showClusters ? 'btn-warning' : 'btn-success','btn-xs']" @click="mapStore.showClusters = !mapStore.showClusters"> <span v-show="!mapStore.showClusters">Show</span> <span v-show="mapStore.showClusters">Hide</span> Clusters </button>
        
          <button :class="['btn', mapStore.showCounties ? 'btn-warning' : 'btn-success','btn-xs']" @click="mapStore.showCounties = !mapStore.showCounties"> <span v-show="!mapStore.showCounties">Show</span> <span v-show="mapStore.showCounties">Hide</span> Counties </button>

          <button class="btn btn-warn btn-xs" @click="clearAllLayers(clear_draw=true)"> Clear Map </button>

        </div>

    </div>

    <div class="map-left-sidebar">
          <slot name="left-sidebar"></slot>
    </div>

    <div class="map-right-sidebar">
        
      <div class="map-search bg-primary" ref="search_container_el"></div>
      
      <div class="divider"></div>

        <div class="flex w-full flex-col" v-show="!mapStore.isVisible && !mapStore.showPlans && showSchedule">
          
          

        <div class="stats stats-vertical shadow">
          <div class="stat">
            <div class="stat-title">Duration</div>
            <div class="stat-value">{{ planArray[0] }} days</div>
            <div class="stat-desc">{{planStartDate}} - {{planArray[1]}} {{ costArray[3] }} Months Leased</div>
          </div>

          <div class="stat">
            <div class="stat-title">Total Planned Collects</div>
            <div class="stat-value">{{ numClusters }}</div>
            <div class="stat-desc">( {{ numBridges }} bridges)</div>
          </div>

          <div class="stat">
            <div class="stat-title">Cost</div>
            <div class="stat-value">{{ costArray[0] }}$</div>
            <div class="stat-desc"> cost per day: {{ costArray[1] }} $</div>
            <div class="stat-desc"> cost per bridge: {{ costArray[2] }} $</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="card bg-base-100 w-full">
          <div class="card-body">
            <h2 class="card-title">Scheduling Controls</h2>

        <div class="join join-vertical">
          <div class="join join-horizontal">
            <label class="label bg-base-100">
              <span class="label-text">Start Date - </span>
            </label>
            <input type="date" class="input text-center" v-model="planStartDate"/>
          </div>
          
          <label class="label bg-base-100">
              <span class="label-text">Excluded Months - </span>
          </label>
          <div class="dropdown text-xs">
            <div tabindex="0" role="button" class="btn btn-warning btn-xs ">
              {{ selectedOptions }}
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-xs">
              <li v-for="option in options" :key="option.id">
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" v-model="option.selected" class="checkbox checkbox-primary" />
                  <span>{{ option.name }}</span>
                </label>
              </li>
            </ul>
          </div>
          <div>
          <fieldset class="fieldset p-2 bg-base-100 w-auto">
            <label class="fieldset-label text-xs">
              <input type="checkbox" checked="checked" class="checkbox" v-model="excludeWeekends"/>
               Exclude Weekends
            </label>
          </fieldset>
          </div>
          <div class="flex items-center gap-2 w-auto">
            <label class="floating-label bg-base-100">
              <span class="label-text">Available Docks - </span>
            </label>
            <input 
              type="number" 
              v-model="numberSystems" 
              min="1" 
              max="10" 
              class="input input-bordered w-auto text-center btn-sm"
            />
          </div>
          <div class="flex items-center gap-2 w-auto">
            <label class="floating-label bg-base-100">
              <span class="label-text">Hourly Labor Cost -  </span>
            </label>
            <input 
              type="number" 
              v-model="laborHourlyCost" 
              min="10" 
              max="1000" 
              class="input input-bordered w-auto text-center btn-sm"
            ><span class="unit bg-base-100">$</span></input>
          </div>
          <div class="w-full max-w-xs">
            <label class="floating-label center bg-base-100">
              <span class="label-text">Efficiency Modifier - </span>
            </label>
            <input type="range" min="0.2" max="1" class="range bg-base-100 btn-xs" step="0.05" v-model="collectEfficiency"/>
            <div class="flex justify-between px-2.5 mt-0 text-xs bg-base-100">
              <span>|</span>
              <span>|</span>
              <span>|</span>
              <span>|</span>
              <span>|</span>
            </div>
            <div class="flex justify-between px-2.0 mt-0 text-xs bg-base-100">
              <span>20%</span>
              <span>40%</span>
              <span>60%</span>
              <span>80%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        </div>
        </div>

      </div>

    </div>

    <div class="map-wrapper">

      <div ref="map_el" class="map"></div>

      

      <div class="calculation-box">
          <p>Area:</p>
          <div id="calculated-area">
            {{ mapStore.calcArea }} km^2
          </div>
      </div>
    </div>
</template>
  
<script setup>
  import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
  import mapboxgl from 'mapbox-gl';
  import { MapboxAddressAutofill, MapboxSearchBox, MapboxGeocoder, config } from '@mapbox/search-js-web'

  

  import MapboxDraw from "@mapbox/mapbox-gl-draw";  

  mapboxgl.accessToken = 'pk.eyJ1IjoiY21lcnJpZ2FuIiwiYSI6ImNtNjlrNHJoNjBneDkybG4zaW5mZnE1OHoifQ.6K-waLtuExh_XFxgOD-E1w';

  import { getValidCollectionDays,computeDays,calculatePlanCost } from "@/utils/scheduleutils";

  
  import 'mapbox-gl/dist/mapbox-gl.css';

  import * as turf from "@turf/turf";

  import { useMapStore } from "@/stores/mapstore";

  const map_el = ref(null);

  const mapStore = useMapStore();


  const draw_instance = ref(null);

  const search_container_el = ref(null);

  const bbox = ref([-94.769437,38.924986,-94.763933,38.927766])

  const planBBOX = ref([])

  const cluster_bbox = ref([])

  const drawPolygon = ref(2);

  const createDisabled = ref(false);

 


  const options = ref([
    { id: 1, name: "January", selected: true },
    { id: 2, name: "February", selected: true },
    { id: 3, name: "March", selected: false },
    { id: 4, name: "April", selected: false },
    { id: 5, name: "May", selected: false },
    { id: 6, name: "June", selected: false },
    { id: 7, name: "July", selected: false },
    { id: 8, name: "August", selected: false },
    { id: 9, name: "September", selected: false },
    { id: 10, name: "October", selected: false },
    { id: 11, name: "November", selected: true },
    { id: 12, name: "December", selected: true }
  ]);

  const toggleSelection = (option) => {
    option.selected = !option.selected;
  };

  const resetSelectedPlan = () => {
    mapStore.showPlans = !mapStore.showPlans;
    mapStore.selectedPlan = null;
  }

  async function createPlanClusters(){

    const plan_id = mapStore.selectedPlan.id;

    const cluster_params = {
      bridge_names: selectedBridgeNames.value,
      mode: 2,   // 0 dist based, 1 kmeans, 2 time based
      dist: 1200,
      saveClusters: true
    }

    await mapStore.createPlanClusters(plan_id,cluster_params);

    refreshBridges()

  }

  

  const selectedOptions = computed(() => {
    return options.value.filter((opt) => opt.selected).map((opt) => opt.name).join(", ") || "Select options";
  });

  const selectedOptionsIds = computed(() => {
    return options.value.filter((opt) => opt.selected).map((opt) => opt.id);
  });

  //variables for the scheduling calculations

  const today = new Date(); // default planStartDate to today's date
  const planStartDate = ref(today.toISOString().split('T')[0]);

  const numberSystems = ref(2); // Default value

  const allValidDates = ref([]); // Array to store all valid collection days
  const allScheduleDates = ref([]); // Array to store hypothetical date/system pairs

  const collectEfficiency = ref(0.5); // Efficiency of collection

  const totalMonthsLeased = ref(0);

  const laborHourlyCost = ref(30); // Hourly labor cost in dollars

  const systemBaseCost = ref(6000); // Base cost of a collection system
  const systemMonthlyCost = ref(4000); // Monthly cost of a collection system

  const showSchedule = ref(true);

  const excludeWeekends = ref(true);

  const maxMonths = ref(36);

  onMounted(() => {
    
    mapStore.mapbox_instance = new mapboxgl.Map({
      container: map_el.value,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Use your desired Mapbox style
      center: mapStore.mapCenter, 
      zoom: mapStore.mapZoom,
    });

    const searchBoxElement = new MapboxSearchBox();
    searchBoxElement.accessToken = mapboxgl.accessToken;

    searchBoxElement.mapboxgl = mapboxgl

    // bind the search box instance to the map instance
    searchBoxElement.bindMap(mapStore.mapbox_instance)
    search_container_el.value.appendChild(searchBoxElement);


    draw_instance.value = new MapboxDraw({
          displayControlsDefault: false,
          // Select which mapbox-gl-draw control buttons to add to the map_instance.
          controls: {
              polygon: true,
              trash: true
          },
          // Set mapbox-gl-draw to draw by default.
          // The user does not have to click the polygon control button first.
          defaultMode: 'draw_polygon'
    });
    mapStore.mapbox_instance.addControl(draw_instance.value);

    mapStore.mapboxdraw_instance = draw_instance;

    // ON LOAD
    mapStore.mapbox_instance.on("load",() => {
      mapStore.map_mounted = true;

      mapStore.mapbox_instance.addSource("counties", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: 'https://decker-public-hosting.s3.us-east-2.amazonaws.com/georef-united-states-of-america-county.geojson'
      });

      mapStore.mapbox_instance.on('draw.create', updateArea);
      mapStore.mapbox_instance.on('draw.delete', updateArea);
      mapStore.mapbox_instance.on('draw.update', updateArea);

      mapStore.mapbox_instance.on('click', 'counties', (e) => {
            
            draw_instance.value.deleteAll()

            draw_instance.value.add(e.features[0].geometry)

            mapStore.showCounties = false

            updateArea()

            const county = e.features[0].properties.coty_name.replace("]","").replace("[","").slice(1,-1)

            const state = e.features[0].properties.ste_name.replace("]","").replace("[","").slice(1,-1)

            const msg = `<div class="bg-yellow-300 p-4 text-black"><h2>${county} county, ${state}<h2></div>`
            
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(msg)
                .addTo(mapStore.mapbox_instance);
        });

    })

    // register move and zoom events to persist map viewport
    mapStore.mapbox_instance.on('move', (e) => {
      storeViewport(mapStore.mapbox_instance.getCenter(), mapStore.mapbox_instance.getZoom())
    })


  });

  //planArray = [totalPlanDays,planEndDate,tooManyClusters,allScheduleDates]
  const planArray = computed(() => {

    const excludedDays = excludeWeekends.value ? [6, 7] : [];
    const excludedMonths = selectedOptionsIds.value;
    const allValidDates = getValidCollectionDays(planStartDate.value, excludedDays, excludedMonths,maxMonths.value);

    return computeDays(numClusters.value,numberSystems.value,allValidDates,planStartDate.value,collectEfficiency.value)
  })

  // costArray = [planCost , costPerDay, costPerBridge, totalMonthsLeased]
  const costArray = computed(() => {
    return calculatePlanCost(planArray.value[0], laborHourlyCost.value, numClusters.value, systemMonthlyCost.value, numberSystems.value, systemBaseCost.value, numBridges.value)
  })

  const selectedBridgeNames = computed(() => {
    return mapStore.selectedBridges.map((bridge) => bridge.bridge_name)
  })

  watch(selectedBridgeNames, (newValue, oldValue) => {
    // updates bridge layer so selected bridges are in red
    refreshBridges(newValue)
  })

  const numClusters = computed(
    () => mapStore.planClustersPayload.features ? mapStore.planClustersPayload.features.length : 0
  )

  const numBridges = computed(
    () => {

      let bridge_count = 0;

      if (!mapStore.planClustersPayload.features){
        return bridge_count
      }

      //loop clusters to count all bridges
      mapStore.planClustersPayload.features.forEach((cluster) => {
        bridge_count += cluster.properties.bridge_names.length
      })

      return bridge_count

    }
  )

  onUnmounted(() => {
    mapStore.map_mounted = false;

  });

  async function updateArea(e) {
        const data = draw_instance.value.getAll();
        
        if (data.features.length > 0) {
            const area = turf.area(data) / 1e6;

            bbox.value = turf.bbox(data)

            mapStore.drawPolygon = data.features[0].geometry

            await mapStore.fetchBridges(mapStore.drawPolygon);

            refreshBridges()

            // Restrict the area to 2 decimal points.
            mapStore.calcArea = Math.round(area * 100) / 100;
            
        } else {

          mapStore.calcArea = 0;
        }
  }

  function storeViewport(center, zoom) {
    mapStore.mapCenter = center;
    mapStore.mapZoom = zoom;
  }

  // Function to zoom to coordinates
  function zoomToCoordinates(lng, lat, zoomLevel=15) {
    mapStore.mapbox_instance.flyTo({
      center: [lng, lat],
      zoom: zoomLevel
    });
  }

  const resetView = (view_bbox) => {

    mapStore.isVisible = false;

    mapStore.mapbox_instance.fitBounds(view_bbox)
  }

  const handleEvent = (eventName, payload) => {

    switch(eventName){

      case "clustersReturned":
        
        clearLayer("clusters")

        

        

        mapStore.mapbox_instance.addSource("clusters", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.clusters

            });

        mapStore.mapbox_instance.addLayer({
                id: "clusters",
                type: 'fill',
                source: "clusters",
                paint: {
                    'fill-color' : [
                      'case',
                      ['==', ['get', 'saved'], true], '#FF0000',
                      '#FFFF00'
                    ],
                    'fill-opacity': 0.5,
                    'fill-outline-color': "#000000"
                }
          });

        break;
      
      case "planPolygonReturned":
        //add layer for the polygon of current macro plan
        clearLayer("plan")

        mapStore.mapbox_instance.addSource("plan", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: payload.plan

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

        planBBOX.value = turf.bbox(payload.plan.geometry)

        resetView(planBBOX.value)

        break;
      
      case "zoomToCluster":

        cluster_bbox.value = turf.bbox(payload.polygon); 
        
        mapStore.isVisible = false;

        resetView(cluster_bbox.value);


      default:
        // default here 


    }

  }

  const clearLayer = (tag) => {
    if (mapStore.mapbox_instance.getLayer(tag)) {
      mapStore.mapbox_instance.removeLayer(tag);
    }

    if (mapStore.mapbox_instance.getSource(tag)) {
      mapStore.mapbox_instance.removeSource(tag);
    }
  }

  const refreshBridges = (names=[]) => {
      clearLayer("bridges")

      mapStore.mapbox_instance.addSource("bridges", {
      type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
      data: mapStore.bridgePayload

          });

      if (names.length > 0){
        console.log("Filtering bridges by name")
        mapStore.mapbox_instance.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color' : [
                      'case',
                      ['in', ['get', 'bridge_name'], ['literal', names]], '#FF0000',
                      '#FFFF00'
                    ],
                    'circle-radius': 4,
                    'circle-stroke-color':"#000000",
                    'circle-stroke-width':1
                }
          });         
      } else {

        mapStore.mapbox_instance.addLayer({
                id: "bridges",
                type: 'circle',
                source: "bridges",
                paint: {
                    'circle-color' : '#FFFF00',
                    'circle-radius': 4,
                    'circle-stroke-color':"#000000",
                    'circle-stroke-width':1
                }
          });
      }


      if(mapStore.planClustersPayload){

        clearLayer("clusters")

        mapStore.mapbox_instance.addSource("clusters", {
        type: 'geojson', // Type of source (e.g., geojson, vector, raster, etc.)
        data: mapStore.planClustersPayload

            });

        mapStore.mapbox_instance.addLayer({
                id: "clusters",
                type: 'fill',
                source: "clusters",
                paint: {
                    'fill-color' : [
                      'case',
                      ['==', ['get', 'saved'], true], '#FF0000',
                      '#FFFF00'
                    ],
                    'fill-opacity': 0.5,
                    'fill-outline-color': "#000000"
                }
          });

      }


  }

  const clearAllLayers = (clear_draw=false) => {

    if (clear_draw){
      draw_instance.value.deleteAll()
    }
    
    const layers = ["bridges","clusters","plan"];

    for(let layer of layers){
      clearLayer(layer);
    }

    numClusters.value = 0;

  }
  

</script>
  
<style scoped>
 
.map-wrapper {
  position: relative;
  z-index: 1;
}

.map {
    display: flex;
    height: 100vh;
}

.sb-container {
  position: absolute;
  bottom: 12px;
  left: 15px;
  width: 98%;
  height: 90%;
  background: #000;
  color: #FFF;
}

.map-left-sidebar {
  position: absolute;
  top: 140px;
  left: 10px;
  width: 100%;
  max-width: 1800px;
  z-index: 200;
}

.map-right-sidebar {
  position: absolute;
  top: 75px;
  right: 50px;
  width: 330px;
  max-width: 500px;
  z-index: 200;
}

.calculation-box {
        height: 80px;
        width: 150px;
        position: absolute;
        bottom: 10px;
        right: 10px;
        background-color: rgba(240, 228, 67, 0.9);
        padding: 0px;
        text-align: center;
}

p {
        font-family: 'Open Sans';
        margin: 0;
        font-size: 32px;
}

</style>
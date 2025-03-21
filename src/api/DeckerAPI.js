import axios from 'axios';

const deckerAPI = axios.create({
    baseURL: "http://localhost:8000/api/",
    headers: {
        'Content-Type': 'application/json',
    }
});

deckerAPI.interceptors.request.use(
  config => {
    config.headers.Authorization = `Token 4207b43d17d3be448d07992f6583b48feba3646b`
    // config.headers[REQUEST_ID] = uuidv4()
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

export default {

    // Macroplans

    async get_macroplans() {
        return await deckerAPI.get('v1/macroplans/');
    },

    async create_macroplan(data){
        return await deckerAPI.post('v1/macroplans/', data);
    },

    async get_bridges(polygon){

        const data = {
            "poly": polygon
        }

        return await deckerAPI.post('v1/decker-bridges/geojson/', data);
    }


}
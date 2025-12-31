import endpoints from "../constants/Endpoints";
import api from "./api";
//import { getEndpoint } from "../config/runtimeConfig";

// function getHospitalityPath() {
//   return getEndpoint("HOSPITALITY");
// }
const endpoint = endpoints.HOSPITALITY;

const hospitalityApi = {
  get: (id) => api.get(`${endpoint}/${id}`),
  filtered_list: (page = 0, size = 10, filters = {}, { signal } = {}) => {
    return api.get(endpoint, {
      params: { page, size, ...filters },
      signal,
    });
  },
  create: (payload, confirm = false) =>
    api.post(endpoint, payload, {
      params: confirm ? { confirm: true } : {},
    }),
  update: (id, payload, confirm = false) => {
    return api.put(`${endpoint}/${id}`, payload, {
      params: confirm === true ? { confirm: true } : {},
    });
  },
  deleteOne: (id) => api.delete(`${endpoint}/${id}`),
  batchDelete: (ids) => api.delete(`${endpoint}/batch`, { params: { ids } }),
  export: (filters = {}) =>
    api.get(`${endpoint}/export`, {
      params: { ...filters },
      responseType: "blob",
    }),
};

export default hospitalityApi;

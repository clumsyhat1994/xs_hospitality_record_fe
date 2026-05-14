import endpoints from "../constants/Endpoints";
import api from "./api";

const endpoint = endpoints.USAGE_RECORDS;

const usageRecordApi = {
  get: (id) => api.get(`${endpoint}/${id}`),
  filteredList: (page = 0, size = 10, filters = {}, { signal } = {}) => {
    const params = { page, size };
    for (const [k, v] of Object.entries(filters)) {
      if (v == null) continue;
      if (typeof v === "boolean") {
        params[k] = v;
        continue;
      }
      if (String(v).trim() !== "") params[k] = v;
    }
    return api.get(endpoint, { params, signal });
  },
  create: (payload) => api.post(endpoint, payload),
  update: (id, payload) => api.put(`${endpoint}/${id}`, payload),
  deleteOne: (id) => api.delete(`${endpoint}/${id}`),
  deleteAllocation: (id, purchaseId) => api.delete(`${endpoint}/${id}/allocations/${purchaseId}`),
};

export default usageRecordApi;

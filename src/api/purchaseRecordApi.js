import endpoints from "../constants/Endpoints";
import api from "./api";

const endpoint = endpoints.PURCHASE_RECORDS;

const purchaseRecordApi = {
  get: (id) => api.get(`${endpoint}/${id}`),
  /**
   * @param {Record<string, unknown>} filters
   * @param {{ signal?: AbortSignal; includeIds?: number[] }} [options]
   */
  filteredList: (page = 0, size = 10, filters = {}, options = {}) => {
    const { signal, includeIds } = options;
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    for (const [k, v] of Object.entries(filters)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const item of v) {
          if (item == null || String(item).trim() === "") continue;
          params.append(k, String(item));
        }
      } else {
        const str =
          typeof v === "number" || typeof v === "boolean"
            ? String(v)
            : String(v).trim();
        if (str === "") continue;
        params.set(k, str);
      }
    }
    if (Array.isArray(includeIds) && includeIds.length > 0) {
      for (const id of includeIds) {
        if (id == null || String(id).trim() === "") continue;
        params.append("includePurchaseIds", String(id));
      }
    }
    return api.get(endpoint, { params, signal });
  },
  create: (payload) => api.post(endpoint, payload),
  update: (id, payload) => api.put(`${endpoint}/${id}`, payload),
  deleteOne: (id) => api.delete(`${endpoint}/${id}`),
};

export default purchaseRecordApi;

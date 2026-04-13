import endpoints from "../constants/Endpoints";
import api from "./api";
import { hospitalityImageFileUrl } from "../utils/hospitalityFileUrl";

const endpoint = endpoints.HOSPITALITY;

const hospitalityApi = {
  get: (id) => api.get(`${endpoint}/${id}`),
  filtered_list: (page = 0, size = 10, filters = {}, { signal } = {}) => {
    const params = { page, size };
    for (const [k, v] of Object.entries(filters)) {
      if (v != null) params[k] = v;
    }
    return api.get(endpoint, {
      params,
      signal,
    });
  },
  create: (payload, confirm = false) =>
    api.post(endpoint, payload, {
      params: confirm ? { confirm: true } : {},
    }),
  /** Multipart create: FormData with part "record" (JSON blob) + optional invoiceImages / hospitalityFormImages files */
  createWithFiles: (formData, confirm = false) =>
    api.post(endpoint, formData, {
      params: confirm ? { confirm: true } : {},
    }),
  update: (id, payload, confirm = false) => {
    return api.put(`${endpoint}/${id}`, payload, {
      params: confirm === true ? { confirm: true } : {},
    });
  },
  /**
   * Add/remove attachments; files are stored only when this succeeds.
   * formData: invoiceImages / hospitalityFormImages file parts
   * query: URLSearchParams with removeInvoicePaths/removeFormPaths
   */
  patchAttachments: (id, formData, query) => {
    const q = query && query.toString ? query.toString() : "";
    const url = q ? `${endpoint}/${id}/attachments?${q}` : `${endpoint}/${id}/attachments`;
    return api.patch(url, formData);
  },
  fetchAttachmentBlob: (relativePath) => {
    const url = hospitalityImageFileUrl(relativePath);
    if (!url) return Promise.resolve(null);
    return api.get(url, { responseType: "blob" });
  },
  deleteOne: (id) => api.delete(`${endpoint}/${id}`),
  batchDelete: (ids) => api.delete(`${endpoint}/batch`, { params: { ids } }),
  export: (filters = {}) => {
    const params = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v != null) params[k] = v;
    }
    return api.get(`${endpoint}/export`, {
      params,
      responseType: "blob",
    });
  },
};

export default hospitalityApi;

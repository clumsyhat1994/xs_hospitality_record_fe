import api from "./api";
const masterDataApi = {
  listDepartments: () => api.get("/api/department"),
  searchDepartments: (keyword, includeId) =>
    api.get("/api/department/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),

  listHospitalityTypes: () => api.get("/api/hospitality-type"),
  searchHospitalityTypes: (keyword, includeId) =>
    api.get("/api/hospitality-type/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),
  listCounterParties: (page = 0, size = 50, keyword) => {
    return api.get("/api/counterparty", { params: { page, size, q: keyword } });
  },
  createCounterParty: (payload) => api.post(`/api/counterparty`, payload),
  updateCounterParty: (id, payload) =>
    api.put(`/api/counterparty/${id}`, payload),
  deleteCounterParty: (id) => api.delete(`/api/counterparty/${id}`),
  searchCounterParties: (keyword, includeId) =>
    api.get("/api/counterparty/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),
  activateCounterparty: (id) => {
    api.patch(`/api/counterparty/${id}/activate`);
  },
  deactivateCounterparty: (id) => {
    api.patch(`/api/counterparty/${id}/deactivate`);
  },
  exportCounterparty: () =>
    api.get(`/api/counterparty/export`, {
      responseType: "blob",
    }),

  listPositions: () => api.get("/api/position"),
  searchPositions: (keyword, includeId) =>
    api.get("/api/position/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),

  searchCounterpartyTypes: (keyword = "", includeId) =>
    api.get("/api/counterparty-type/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),
  createHandler: (payload) => api.post(`/api/employee`, payload),
  searchHandlers: (keyword, includeId) =>
    api.get("/api/employee/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),
};

export default masterDataApi;

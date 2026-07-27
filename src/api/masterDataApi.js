import api from "./api";
const masterDataApi = {
  listDepartments: (page = 0, size = 50, keyword) =>
    api.get("/api/department", {
      params: {
        page,
        size,
        q: keyword || undefined,
        sort: "sortOrder,asc",
      },
    }),
  createDepartment: (payload) => api.post("/api/department", payload),
  updateDepartment: (id, payload) =>
    api.put(`/api/department/${id}`, payload),
  activateDepartment: (id) => api.patch(`/api/department/${id}/activate`),
  deactivateDepartment: (id) =>
    api.patch(`/api/department/${id}/deactivate`),
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
  listCounterParties: (page = 0, size = 50, keyword, role) => {
    return api.get("/api/counterparty", {
      params: {
        page,
        size,
        q: keyword,
        role: role === "" ? undefined : role,
      },
    });
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
  searchCounterPartiesByRole: (keyword, includeId, role) =>
    api.get("/api/counterparty/search-by-role", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
        role: role === "" ? undefined : role,
      },
    }),
  searchSuppliers: (keyword, includeId) =>
    api.get("/api/counterparty/search-suppliers", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),
  searchCustomers: (keyword, includeId) =>
    api.get("/api/counterparty/search-customers", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),
  activateCounterparty: (id) =>
    api.patch(`/api/counterparty/${id}/activate`),
  deactivateCounterparty: (id) =>
    api.patch(`/api/counterparty/${id}/deactivate`),
  exportCounterparty: () =>
    api.get(`/api/counterparty/export`, {
      responseType: "blob",
    }),
  importCounterparty: (payload) =>
    api.post(`/api/counterparty/import`, payload),

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
  searchCounterpartyRoles: () => api.get("/api/counterparty-role/search"),
  createHandler: (payload) => api.post(`/api/employee`, payload),
  searchHandlers: (keyword, includeId) =>
    api.get("/api/employee/search", {
      params: {
        q: keyword,
        includeId: includeId === "" ? undefined : includeId,
      },
    }),

  listPerCapitaLimits: (page = 0, size = 50) =>
    api.get("/api/per_capita_limit", {
      params: { page, size, sort: "type.sortOrder,asc" },
    }),
  updatePerCapitaLimit: (id, payload) =>
    api.put(`/api/per_capita_limit/${id}`, payload),
  activatePerCapitaLimit: (id) =>
    api.patch(`/api/per_capita_limit/${id}/activate`),
  deactivatePerCapitaLimit: (id) =>
    api.patch(`/api/per_capita_limit/${id}/deactivate`),
};

export default masterDataApi;

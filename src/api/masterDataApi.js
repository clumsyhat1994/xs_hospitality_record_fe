import api from "./api";
const masterDataApi = {
  listDepartments: () => api.get("/api/department"),

  listHospitalityTypes: () => api.get("/api/hospitality-type"),

  listCounterParties: (page = 0, size = 50, keyword) => {
    return api.get("/api/counterparty", { params: { page, size, q: keyword } });
  },
  createCounterParty: (payload) => api.post(`/api/counterparty`, payload),
  updateCounterParty: (id, payload) =>
    api.put(`/api/counterparty/${id}`, payload),
  deleteCounterParty: (id) => api.delete(`/api/counterparty/${id}`),
  searchCounterParties: (keyword) =>
    api.get("/api/counterparty/search", {
      params: { q: keyword },
    }),
  activateCounterparty: (id) => {
    api.patch(`/api/counterparty/${id}/activate`);
  },

  deactivateCounterparty: (id) => {
    api.patch(`/api/counterparty/${id}/deactivate`);
  },

  listPositions: () => api.get("/api/position"),
};

export default masterDataApi;

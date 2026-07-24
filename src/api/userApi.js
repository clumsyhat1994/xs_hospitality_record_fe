import api from "./api";

const userApi = {
  listUsers: (page = 0, size = 20, keyword) =>
    api.get("/api/users", {
      params: {
        page,
        size,
        q: keyword || undefined,
      },
    }),
  getUser: (id) => api.get(`/api/users/${id}`),
  createUser: (payload) => api.post("/api/users", payload),
  updateUser: (id, payload) => api.put(`/api/users/${id}`, payload),
  enableUser: (id) => api.patch(`/api/users/${id}/enable`),
  disableUser: (id) => api.patch(`/api/users/${id}/disable`),
  listRoles: () => api.get("/api/users/roles"),
};

export default userApi;

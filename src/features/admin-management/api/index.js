import http from "@/shared/api/http";

export const adminsAPI = {
  getAll: () => http.get("/api/admins"),
  getById: (id) => http.get(`/api/admins/${id}`),
  create: (data) => http.post("/api/admins", data),
  update: (id, data) => http.put(`/api/admins/${id}`, data),
  delete: (id) => http.delete(`/api/admins/${id}`),
  setRegion: (id, data) => http.put(`/api/admins/${id}/region`, data),
  updatePermissions: (id, data) => http.put(`/api/admins/${id}/permissions`, data),
  updateDelegation: (id, data) => http.put(`/api/admins/${id}/delegation`, data),
};



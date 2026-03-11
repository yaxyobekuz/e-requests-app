import http from "@/shared/api/http";

export const requestsAPI = {
  getAll: (params) => http.get("/api/requests", { params }),
  getById: (id) => http.get(`/api/requests/${id}`),
  updateStatus: (id, data) => http.put(`/api/requests/${id}/status`, data),
};



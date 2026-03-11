import http from "@/shared/api/http";

export const servicesAPI = {
  getAll: () => http.get("/api/services"),
  create: (data) => http.post("/api/services", data),
  update: (id, data) => http.put(`/api/services/${id}`, data),
  delete: (id) => http.delete(`/api/services/${id}`),
};

export const serviceReportsAPI = {
  getAll: (params) => http.get("/api/service-reports", { params }),
  getById: (id) => http.get(`/api/service-reports/${id}`),
  updateStatus: (id, data) => http.put(`/api/service-reports/${id}/status`, data),
};



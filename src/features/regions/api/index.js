import http from "@/shared/api/http";

export const regionsAPI = {
  getAll: (params) => http.get("/api/regions", { params }),
  getById: (id) => http.get(`/api/regions/${id}`),
};

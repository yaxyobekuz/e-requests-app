import http from "@/shared/api/http";

export const mskAPI = {
  getCategories: () => http.get("/api/msk/categories"),
  createCategory: (data) => http.post("/api/msk/categories", data),
  updateCategory: (id, data) => http.put(`/api/msk/categories/${id}`, data),
  deleteCategory: (id) => http.delete(`/api/msk/categories/${id}`),
  getAllOrders: (params) => http.get("/api/msk/orders", { params }),
  getOrderById: (id) => http.get(`/api/msk/orders/${id}`),
  updateOrderStatus: (id, data) => http.put(`/api/msk/orders/${id}/status`, data),
};




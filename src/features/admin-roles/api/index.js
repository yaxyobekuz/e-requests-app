import http from "@/shared/api/http";

export const adminRolesAPI = {
  getAll: () => http.get("/api/admin-roles"),
};

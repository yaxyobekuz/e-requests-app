import http from "@/shared/api/http";

export const usersAPI = {
  /**
   * Foydalanuvchilar ro'yxati (paginated).
   * @param {{ regionId?: string, districtId?: string, neighborhoodId?: string, houseType?: string, isActive?: string, page?: number, limit?: number }} params
   * @returns {Promise}
   */
  getAll: (params) => http.get("/api/admin/users", { params }),
};

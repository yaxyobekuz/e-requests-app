import http from "@/shared/api/http";

/**
 * Profil API — joriy foydalanuvchi uchun
 */
export const profileAPI = {
  /** GET /api/auth/me — to'liq user ma'lumotlari (ruxsatlar bilan) */
  getMe: () => http.get("/api/auth/me"),
  /** PUT /api/auth/me — alias, firstName, lastName yangilash */
  updateMe: (data) => http.put("/api/auth/me", data),
  /** PUT /api/auth/change-password — parol o'zgartirish */
  changePassword: (data) => http.put("/api/auth/change-password", data),
};

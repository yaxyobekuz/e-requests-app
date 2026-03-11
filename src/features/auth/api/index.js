import http from "@/shared/api/http";

export const authAPI = {
  login: (data) => http.post("/api/auth/admin/login", data),
  loginWithOtp: (data) => http.post("/api/auth/admin/login/otp", data),
  getMe: () => http.get("/api/auth/me"),
};



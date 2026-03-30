import http from "@/shared/api/http";

/**
 * Mahsulotlar uchun API metodlar (faqat o'qish).
 */
export const productsAPI = {
  /** Barcha faol mahsulotlarni navlari bilan qaytaradi. */
  getAll: () => http.get("/api/products"),
};

import http from "@/shared/api/http";

export const requestTypesAPI = {
  getAll: () => http.get("/api/request-types"),
};

// src/api/auth.js
import api from "@/lib/api";

export const loginAdmin = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data; // { token, admin }
};

export const checkAuth = async () => {
  const { data } = await api.get("/auth/check-auth");
  return data.data; // { admin }
};

export const logoutAdmin = async () => {
  await api.post("/auth/logout");
};

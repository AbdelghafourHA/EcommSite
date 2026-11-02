// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* -------------------------------------------------------------------------- */
/*                          Request interceptor                               */
/* -------------------------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set the Content-Type for FormData (multipart boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------------------------- */
/*                          Response interceptor                              */
/* -------------------------------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Auto-logout on expired/invalid token — except on the login endpoint
    if (status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      const lang = window.location.pathname.split("/")[1] || "ar";
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = `/${lang}/admin/login`;
      }
    }

    // Normalize error message for the UI
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error. Please try again.";

    return Promise.reject(
      Object.assign(new Error(message), {
        status,
        details: error.response?.data?.details || null,
      })
    );
  }
);

export default api;

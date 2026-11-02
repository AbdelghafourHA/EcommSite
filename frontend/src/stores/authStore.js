// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      admin: null,

      setAuth: (token, admin) => {
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", JSON.stringify(admin));
        set({ token, admin });
      },

      logout: () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        set({ token: null, admin: null });
      },

      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, admin: state.admin }),
    }
  )
);

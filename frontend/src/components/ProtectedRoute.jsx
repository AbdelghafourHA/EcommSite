// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function ProtectedRoute({ lang }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to={`/${lang}/admin/login`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}

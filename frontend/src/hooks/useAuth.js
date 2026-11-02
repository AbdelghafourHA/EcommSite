// src/hooks/useAuth.js
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useLang } from "@/hooks/useLang";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const { lang } = useLang();

  return useMutation({
    mutationFn: ({ email, password }) => loginAdmin(email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.admin);
      navigate(`/${lang}/admin`, { replace: true });
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { lang } = useLang();

  return () => {
    logout();
    navigate(`/${lang}/admin/login`, { replace: true });
  };
};

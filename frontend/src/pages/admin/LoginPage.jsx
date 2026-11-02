// src/pages/admin/LoginPage.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { useAuthStore } from "@/stores/authStore";
import phoenixLogo from "@/assets/phoenix_logo_with_text.png";

export default function LoginPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => Boolean(s.token));
  const mutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuth) navigate(`/${lang}/admin`, { replace: true });
  }, [isAuth, lang, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-stone-100 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src={phoenixLogo}
            alt="PHOENIX"
            className="h-20 w-auto mx-auto mb-3 object-contain"
          />
          <h1 className="font-heading font-bold text-2xl text-stone-900">
            {t("admin.login")}
          </h1>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{mutation.error?.message || t("admin.loginError")}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.email")}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-primary-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.password")}
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-primary-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition"
          >
            <LogIn className="w-4 h-4" />
            {mutation.isPending ? t("common.loading") : t("admin.login")}
          </button>
        </form>

        <Link
          to={`/${lang}`}
          className="block text-center text-sm text-stone-500 hover:text-primary-600 mt-6"
        >
          ← {t("nav.home")}
        </Link>
      </div>
    </div>
  );
}

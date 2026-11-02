// src/layouts/AdminLayout.jsx
import { Outlet, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Package, Tag, LogOut, Menu } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/hooks/useLang";
import { useLogout } from "@/hooks/useAuth";
import phoenixLogo from "@/assets/phoenix_logo_no_text.png";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const handleLogout = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-md transition ${
      isActive
        ? "bg-primary-500 text-white"
        : "text-stone-700 hover:bg-stone-100"
    }`;

  return (
    <div className="min-h-screen flex bg-stone-50">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } fixed lg:static inset-y-0 start-0 z-40 w-64 bg-white border-e border-stone-200 flex flex-col transition-transform duration-200`}
      >
        <div className="p-4 border-b border-stone-200">
          <Link to={`/${lang}/admin`} className="flex items-center gap-2">
            <img
              src={phoenixLogo}
              alt="PHOENIX"
              className="h-10 w-auto object-contain"
            />
            <span className="font-heading font-bold text-sm text-stone-700">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to={`/${lang}/admin`} end className={linkClass}>
            <LayoutDashboard className="w-5 h-5" />
            {t("admin.dashboard")}
          </NavLink>
          <NavLink to={`/${lang}/admin/categories`} className={linkClass}>
            <Tag className="w-5 h-5" />
            {t("admin.categories")}
          </NavLink>
          <NavLink to={`/${lang}/admin/products`} className={linkClass}>
            <Package className="w-5 h-5" />
            {t("admin.products")}
          </NavLink>
        </nav>

        <div className="p-3 border-t border-stone-200">
          <Link
            to={`/${lang}`}
            className="block px-4 py-2 text-xs text-stone-500 hover:text-primary-600 mb-1"
          >
            ← {t("nav.home")}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-danger hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="lg:hidden p-2 rounded-md hover:bg-stone-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <LanguageSwitcher />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

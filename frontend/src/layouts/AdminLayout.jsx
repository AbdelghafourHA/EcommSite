// src/layouts/AdminLayout.jsx
import { Outlet, Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Package, Tag, LogOut, Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/hooks/useLang";
import { useLogout } from "@/hooks/useAuth";
import phoenixLogo from "@/assets/phoenix-logo.png";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const handleLogout = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-md transition ${
      isActive
        ? "bg-primary-500 text-white"
        : "text-stone-700 hover:bg-stone-100"
    }`;

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* ───────── Mobile overlay ───────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ───────── Sidebar ───────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 start-0 z-50 w-64 bg-white border-e border-stone-200 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full rtl:translate-x-full"
          }
        `}
      >
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <Link
            to={`/${lang}/admin`}
            className="flex items-center gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <img
              src={phoenixLogo}
              alt="PHOENIX"
              className="h-9 w-auto object-contain"
            />
            <span className="font-heading font-bold text-sm text-stone-700">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-stone-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink
            to={`/${lang}/admin`}
            end
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {t("admin.dashboard")}
          </NavLink>
          <NavLink
            to={`/${lang}/admin/categories`}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Tag className="w-5 h-5 shrink-0" />
            {t("admin.categories")}
          </NavLink>
          <NavLink
            to={`/${lang}/admin/products`}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Package className="w-5 h-5 shrink-0" />
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
            <LogOut className="w-5 h-5 shrink-0" />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* ───────── Main content ───────── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ms-1 rounded-md hover:bg-stone-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img
              src={phoenixLogo}
              alt="PHOENIX"
              className="lg:hidden h-8 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// src/pages/admin/DashboardPage.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  Tag,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useLang } from "@/hooks/useLang";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const admin = useAuthStore((s) => s.admin);
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: catsData } = useCategories();

  const productCount = productsData?.total ?? 0;
  const categoryCount = catsData?.count ?? 0;
  const inStockCount =
    productsData?.products?.filter((p) => p.inStock).length ?? 0;

  const stats = [
    {
      label: t("admin.products"),
      value: productCount,
      icon: <Package className="w-5 h-5" />,
      color: "bg-blue-50 text-blue-600",
      href: `/${lang}/admin/products`,
    },
    {
      label: t("admin.categories"),
      value: categoryCount,
      icon: <Tag className="w-5 h-5" />,
      color: "bg-purple-50 text-purple-600",
      href: `/${lang}/admin/categories`,
    },
    {
      label: t("product.inStock"),
      value: inStockCount,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: t("product.outOfStock"),
      value: Math.max(0, productCount - inStockCount),
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl">
          {t("admin.dashboard")}
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1 truncate">
          {lang === "ar"
            ? `مرحبا ${admin?.email}`
            : lang === "fr"
            ? `Bienvenue ${admin?.email}`
            : `Welcome ${admin?.email}`}
        </p>
      </div>

      {/* Stats grid — 2 cols on phone, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((s, i) => {
          const content = (
            <div className="bg-white rounded-lg sm:rounded-xl border border-stone-200 p-3 sm:p-4 hover:shadow-sm transition h-full">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${s.color} flex items-center justify-center mb-2 sm:mb-3`}
              >
                {s.icon}
              </div>
              <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
              <div className="text-[11px] sm:text-sm text-stone-500 mt-0.5 sm:mt-1 leading-tight">
                {s.label}
              </div>
            </div>
          );
          return s.href ? (
            <Link key={i} to={s.href}>
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <h2 className="font-heading font-bold text-base sm:text-lg mb-3">
        {lang === "ar"
          ? "إجراءات سريعة"
          : lang === "fr"
          ? "Actions rapides"
          : "Quick actions"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to={`/${lang}/admin/categories`}
          className="bg-white rounded-lg sm:rounded-xl border border-stone-200 p-4 sm:p-5 hover:border-primary-300 hover:shadow-sm transition flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">
                {t("admin.addCategory")}
              </div>
              <div className="text-xs text-stone-500 truncate">
                {t("admin.categories")}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 shrink-0 flip-rtl group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to={`/${lang}/admin/products`}
          className="bg-white rounded-lg sm:rounded-xl border border-stone-200 p-4 sm:p-5 hover:border-primary-300 hover:shadow-sm transition flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">
                {t("admin.addProduct")}
              </div>
              <div className="text-xs text-stone-500 truncate">
                {t("admin.products")}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 shrink-0 flip-rtl group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}

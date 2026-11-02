// src/pages/admin/DashboardPage.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, Tag, TrendingUp, ShoppingBag } from "lucide-react";
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
      icon: <Package className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600",
      href: `/${lang}/admin/products`,
    },
    {
      label: t("admin.categories"),
      value: categoryCount,
      icon: <Tag className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600",
      href: `/${lang}/admin/categories`,
    },
    {
      label: t("product.inStock"),
      value: inStockCount,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: t("product.outOfStock"),
      value: productCount - inStockCount,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl">
          {t("admin.dashboard")}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {lang === "ar"
            ? `مرحبا ${admin?.email}`
            : lang === "fr"
            ? `Bienvenue ${admin?.email}`
            : `Welcome ${admin?.email}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const content = (
            <div className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition">
              <div
                className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}
              >
                {s.icon}
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-stone-500 mt-1">{s.label}</div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to={`/${lang}/admin/categories`}
          className="bg-white rounded-xl border border-stone-200 p-6 hover:border-primary-300 hover:shadow-sm transition flex items-center gap-3"
        >
          <Tag className="w-6 h-6 text-primary-600" />
          <div>
            <div className="font-semibold">{t("admin.addCategory")}</div>
            <div className="text-sm text-stone-500">
              {t("admin.categories")}
            </div>
          </div>
        </Link>

        <Link
          to={`/${lang}/admin/products`}
          className="bg-white rounded-xl border border-stone-200 p-6 hover:border-primary-300 hover:shadow-sm transition flex items-center gap-3"
        >
          <Package className="w-6 h-6 text-primary-600" />
          <div>
            <div className="font-semibold">{t("admin.addProduct")}</div>
            <div className="text-sm text-stone-500">{t("admin.products")}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

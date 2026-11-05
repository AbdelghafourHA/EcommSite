// src/pages/ProductsPage.jsx
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import CategoryStrip from "@/components/CategoryStrip";
import { ProductGridSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

const SORT_OPTIONS = [
  { value: "newest", labelKey: "sortNewest", fallback: "Newest" },
  {
    value: "price_asc",
    labelKey: "sortPriceAsc",
    fallback: "Price: Low to High",
  },
  {
    value: "price_desc",
    labelKey: "sortPriceDesc",
    fallback: "Price: High to Low",
  },
];

export default function ProductsPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [params, setParams] = useSearchParams();

  const search = params.get("q") || "";
  const sort = params.get("sort") || "newest";
  const page = Number(params.get("page")) || 1;

  const { data, isLoading } = useProducts({ search, sort, page, limit: 12 });
  const products = data?.products || [];
  const pagination = data?.pagination;

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-6">
        {t("nav.products")}
      </h1>

      <CategoryStrip />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <SlidersHorizontal className="w-4 h-4" />
          {isLoading
            ? "…"
            : `${data?.total ?? 0} ${
                lang === "ar" ? "منتج" : lang === "fr" ? "produits" : "products"
              }`}
        </div>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="text-sm px-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-primary-500 focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(`category.${o.labelKey}`, o.fallback)}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<SearchX className="w-10 h-10 text-stone-300" />}
          title={
            lang === "ar"
              ? "لا توجد نتائج"
              : lang === "fr"
              ? "Aucun résultat"
              : "No results found"
          }
          message={
            search
              ? lang === "ar"
                ? `لم نجد أي شيء لـ "${search}".`
                : lang === "fr"
                ? `Rien trouvé pour "${search}".`
                : `Nothing found for "${search}".`
              : undefined
          }
          action={
            search ? (
              <Link
                to={`/${lang}/products`}
                className="mt-4 text-primary-600 hover:underline text-sm font-medium"
              >
                {lang === "ar"
                  ? "مسح البحث"
                  : lang === "fr"
                  ? "Effacer la recherche"
                  : "Clear search"}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateParam("page", page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-sm font-medium border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition"
              >
                {t("common.previous")}
              </button>
              <span className="px-3 py-2 text-sm text-stone-600">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => updateParam("page", page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-sm font-medium border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

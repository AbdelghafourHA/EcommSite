// src/pages/ProductsPage.jsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
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
    fallback: "Price: low to high",
  },
  {
    value: "price_desc",
    labelKey: "sortPriceDesc",
    fallback: "Price: high to low",
  },
];

export default function ProductsPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [params, setParams] = useSearchParams();

  const search = params.get("q") || "";
  const sort = params.get("sort") || "newest";
  const page = Number(params.get("page")) || 1;

  const { data, isLoading } = useProducts({
    search,
    sort,
    page,
    limit: 12,
  });

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
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-4">
        {t("nav.products")}
      </h1>

      <CategoryStrip />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 my-6 pb-4 border-b border-stone-200">
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
          className="text-sm px-3 py-2 bg-white border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none"
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
          title={
            lang === "ar"
              ? "لا توجد منتجات"
              : lang === "fr"
              ? "Aucun produit"
              : "No products"
          }
          message={
            search
              ? lang === "ar"
                ? `لا توجد نتائج لـ "${search}"`
                : lang === "fr"
                ? `Aucun résultat pour "${search}"`
                : `No results for "${search}"`
              : undefined
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
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateParam("page", page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-sm border border-stone-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
              >
                {t("common.previous")}
              </button>
              <span className="px-3 py-2 text-sm text-stone-600">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => updateParam("page", page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-sm border border-stone-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
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

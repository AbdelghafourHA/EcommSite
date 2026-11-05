// src/pages/ProductsPage.jsx
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

  const { data, isLoading, error } = useProducts({
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

  const goToPage = (newPage) => {
    const next = new URLSearchParams(params);
    if (newPage > 1) next.set("page", String(newPage));
    else next.delete("page");
    setParams(next, { replace: true });
    // Scroll to top of grid for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          {isLoading ? (
            <span>…</span>
          ) : (
            <span>
              {data?.total ?? 0}{" "}
              {lang === "ar" ? "منتج" : lang === "fr" ? "produits" : "products"}
            </span>
          )}
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
      {error ? (
        <EmptyState title={t("common.error")} message={error.message} />
      ) : isLoading ? (
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
                {t("common.clearSearch")}
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

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={!pagination.hasPrevPage || isLoading}
                className="px-4 py-2 text-sm font-medium border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition"
              >
                {t("common.previous")}
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const total = pagination.totalPages;
                  const current = pagination.currentPage;
                  const pages = [];

                  const pushPage = (n) => pages.push(n);
                  const pushDots = () => pages.push("...");

                  if (total <= 7) {
                    for (let i = 1; i <= total; i++) pushPage(i);
                  } else {
                    pushPage(1);
                    if (current > 3) pushDots();
                    const start = Math.max(2, current - 1);
                    const end = Math.min(total - 1, current + 1);
                    for (let i = start; i <= end; i++) pushPage(i);
                    if (current < total - 2) pushDots();
                    pushPage(total);
                  }

                  return pages.map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-2 text-stone-400 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        disabled={p === page || isLoading}
                        className={`min-w-[2.25rem] h-9 px-3 text-sm font-medium rounded-lg transition ${
                          p === page
                            ? "bg-primary-500 text-white"
                            : "border border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={!pagination.hasNextPage || isLoading}
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

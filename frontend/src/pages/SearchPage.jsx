// src/pages/SearchPage.jsx
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function SearchPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  const { data, isLoading } = useProducts({ search: query, limit: 24 });
  const products = data?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2">
        {t("common.search")}
      </h1>
      <p className="text-stone-500 mb-6">
        {query
          ? lang === "ar"
            ? `نتائج البحث عن "${query}"`
            : lang === "fr"
            ? `Résultats pour "${query}"`
            : `Results for "${query}"`
          : ""}
      </p>

      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <EmptyState
          title={
            lang === "ar"
              ? "لا توجد نتائج"
              : lang === "fr"
              ? "Aucun résultat"
              : "No results"
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

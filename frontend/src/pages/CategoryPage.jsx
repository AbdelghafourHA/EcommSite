// src/pages/CategoryPage.jsx
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useLang } from "@/hooks/useLang";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryBySlug } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import CategoryStrip from "@/components/CategoryStrip";
import { ProductGridSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { lang } = useLang();

  const { data: category, isLoading: loadingCategory } =
    useCategoryBySlug(slug);
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    category: category?._id,
    limit: 24,
  });

  const title = category?.name?.[lang] || category?.name?.en || slug;
  const products = productsData?.products || [];

  return (
    <>
      <Helmet>
        <title>{title} — متجري</title>
        <meta name="description" content={`${title} — تصفح المنتجات`} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          {loadingCategory ? (
            <div className="h-9 w-48 bg-stone-200 rounded animate-pulse" />
          ) : (
            <h1 className="font-heading font-bold text-2xl md:text-3xl flex items-center gap-3">
              <span className="text-3xl">{category?.emoji || "🍽️"}</span>
              {title}
            </h1>
          )}
        </div>

        <CategoryStrip activeSlug={slug} />

        <div className="mt-6">
          {loadingProducts || loadingCategory ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState title={t("category.noProducts")} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

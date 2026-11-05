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
  const description =
    category?.description?.[lang] || category?.description?.en || "";
  const products = productsData?.products || [];

  return (
    <>
      <Helmet>
        <title>{title} — PHOENIX</title>
        <meta
          name="description"
          content={description || `${title} — تصفح المنتجات`}
        />
        <meta property="og:title" content={title} />
        {category?.image && (
          <meta property="og:image" content={category.image} />
        )}
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category hero */}
        <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary-500 to-primary-700 relative">
          {loadingCategory ? (
            <div className="h-40 sm:h-52 bg-stone-200 animate-pulse" />
          ) : (
            <div className="relative h-40 sm:h-52 md:h-64 flex items-end">
              {category?.image && (
                <>
                  <img
                    src={category.image}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </>
              )}
              <div className="relative z-10 p-5 sm:p-8 text-white w-full">
                <div className="flex items-center gap-3">
                  {!category?.image && (
                    <span className="text-3xl sm:text-4xl">
                      {category?.emoji || "🍽️"}
                    </span>
                  )}
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl drop-shadow-lg">
                    {title}
                  </h1>
                </div>
                {description && (
                  <p className="text-sm sm:text-base text-white/90 mt-2 max-w-2xl drop-shadow">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <CategoryStrip activeSlug={slug} />

        <div className="mt-4">
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

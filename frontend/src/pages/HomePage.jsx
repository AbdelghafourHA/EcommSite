// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { data: featured, isLoading: loadingFeatured } = useFeaturedProducts(8);
  const { data: catsData, isLoading: loadingCats } = useCategories({
    activeOnly: true,
  });

  const categories = catsData?.categories || [];
  const products = featured?.products || [];

  const seoTitle =
    lang === "ar"
      ? "متجري — أفضل المنتجات"
      : lang === "fr"
      ? "Ma Boutique — Les meilleurs produits"
      : "My Store — Best Products";

  const seoDescription =
    lang === "ar"
      ? "تصفح منتجاتنا بأفضل الأسعار مع توصيل سريع"
      : lang === "fr"
      ? "Parcourez nos produits aux meilleurs prix avec livraison rapide"
      : "Browse our products at the best prices with fast delivery";

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden relative">
          <div className="px-6 md:px-12 py-16 md:py-24 max-w-2xl relative z-10">
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl leading-tight mb-4">
              {t("home.title")}
            </h1>
            <p className="text-base md:text-lg text-primary-50 mb-6">
              {t("home.subtitle")}
            </p>
            <Link
              to={`/${lang}/products`}
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-lg hover:bg-primary-50 transition"
            >
              {t("home.viewAll")}
              <ArrowRight className="w-4 h-4 flip-rtl" />
            </Link>
          </div>
          <div
            className="hidden md:block absolute end-0 top-0 bottom-0 w-1/3 bg-cover bg-center opacity-40"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80')",
            }}
          />
        </section>

        {/* Categories */}
        {!loadingCats && categories.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl md:text-2xl">
                {t("home.browseCategories")}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((cat) => {
                const name = cat.name?.[lang] || cat.name?.en || "—";
                return (
                  <Link
                    key={cat._id}
                    to={`/${lang}/categories/${cat.slug}`}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-stone-200 hover:border-primary-300 hover:shadow-sm transition text-center"
                  >
                    <span className="text-3xl">{cat.emoji || "🍽️"}</span>
                    <span className="text-sm font-medium text-stone-700 line-clamp-1">
                      {name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-xl md:text-2xl">
              {t("home.featured")}
            </h2>
            <Link
              to={`/${lang}/products`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {t("home.viewAll")}
              <ArrowRight className="w-3 h-3 flip-rtl" />
            </Link>
          </div>

          {loadingFeatured ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title={
                lang === "ar"
                  ? "لا توجد منتجات بعد"
                  : lang === "fr"
                  ? "Aucun produit"
                  : "No products yet"
              }
              message={
                lang === "ar"
                  ? "أضف منتجاتك من لوحة التحكم"
                  : lang === "fr"
                  ? "Ajoutez des produits depuis le tableau de bord"
                  : "Add products from the admin dashboard"
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

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
      ? "PHOENIX — أفضل المنتجات"
      : lang === "fr"
      ? "PHOENIX — Les meilleurs produits"
      : "PHOENIX — Best Products";
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

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* Hero */}
        <section className="rounded-3xl bg-stone-900 text-white overflow-hidden relative min-h-[400px] flex items-center">
          <div className="px-6 md:px-12 py-16 relative z-10 max-w-2xl">
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl leading-tight mb-4">
              {t("home.title")}
            </h1>
            <p className="text-base md:text-lg text-stone-300 mb-8 max-w-lg">
              {t("home.subtitle")}
            </p>
            <Link
              to={`/${lang}/products`}
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-bold px-8 py-3.5 rounded-lg hover:bg-primary-600 transition shadow-lg"
            >
              {t("home.viewAll")}
              <ArrowRight className="w-5 h-5 flip-rtl" />
            </Link>
          </div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80')",
            }}
          />
        </section>

        {/* Categories */}
        {!loadingCats && categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-2xl">
                {t("home.browseCategories")}
              </h2>
              <Link
                to={`/${lang}/products`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                {t("home.viewAll")}
                <ArrowRight className="w-4 h-4 flip-rtl" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => {
                const name = cat.name?.[lang] || cat.name?.en || "—";
                return (
                  <Link
                    key={cat._id}
                    to={`/${lang}/categories/${cat.slug}`}
                    className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-primary-300 hover:shadow-md transition"
                  >
                    <div className="aspect-square bg-stone-100 relative overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {cat.emoji || "🍽️"}
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <span className="text-sm font-semibold text-stone-800 group-hover:text-primary-600 transition">
                        {name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-2xl">
              {t("home.featured")}
            </h2>
            <Link
              to={`/${lang}/products`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {t("home.viewAll")}
              <ArrowRight className="w-4 h-4 flip-rtl" />
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
                  ? "أضف منتجاتك من لوحة التحكم لتظهر هنا."
                  : lang === "fr"
                  ? "Ajoutez des produits depuis le tableau de bord."
                  : "Add products from the dashboard to see them here."
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

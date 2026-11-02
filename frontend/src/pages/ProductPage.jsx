// src/pages/ProductPage.jsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ShoppingCart, Minus, Plus, Tag } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useProductBySlug } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/formatCurrency";
import { buildSingleProductUrl } from "@/lib/whatsapp";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import EmptyState from "@/components/EmptyState";

export default function ProductPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { lang } = useLang();
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-stone-200 rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-stone-200 rounded w-2/3 animate-pulse" />
          <div className="h-6 bg-stone-200 rounded w-1/3 animate-pulse" />
          <div className="h-24 bg-stone-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        title={
          lang === "ar"
            ? "المنتج غير موجود"
            : lang === "fr"
            ? "Produit introuvable"
            : "Product not found"
        }
      />
    );
  }

  const title = product.title?.[lang] || product.title?.en || "—";
  const description =
    product.description?.[lang] || product.description?.en || "";
  const images = product.images?.length ? product.images : [""];
  const inStock = product.inStock;
  const hasDiscount = product.discount > 0;
  const unitPrice = product.discountedPrice ?? product.price;

  const handleAdd = () => {
    addItem(product, qty);
    openCart();
  };

  const whatsappUrl = buildSingleProductUrl(product, lang, qty);

  return (
    <>
      <Helmet>
        <title>{title} — متجري</title>
        <meta name="description" content={description || title} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description || title} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta property="og:type" content="product" />
        <link
          rel="canonical"
          href={`${window.location.origin}/${lang}/products/${product.slug}`}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-stone-500 mb-4 flex items-center gap-2">
          <Link to={`/${lang}`} className="hover:text-primary-600">
            {t("nav.home")}
          </Link>
          <span>/</span>
          <Link to={`/${lang}/products`} className="hover:text-primary-600">
            {t("nav.products")}
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-medium truncate">{title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden relative">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-stone-300">
                  🛍️
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 start-4 bg-danger text-white font-bold px-3 py-1.5 rounded-md">
                  -{product.discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${
                      i === activeImage
                        ? "border-primary-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-3">
              {title}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-primary-600">
                {formatCurrency(unitPrice, lang)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-stone-400 line-through">
                  {formatCurrency(product.price, lang)}
                </span>
              )}
            </div>

            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                  inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    inStock ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {inStock ? t("product.inStock") : t("product.outOfStock")}
              </span>
            </div>

            {description && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2">
                  {t("product.description")}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-stone-200 pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {t("product.quantity")}
                </span>
                <div className="flex items-center border border-stone-200 rounded-md">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={!inStock}
                    className="p-2 hover:bg-stone-50 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-medium min-w-[2.5rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    disabled={!inStock}
                    className="p-2 hover:bg-stone-50 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {inStock && (
                <>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t("product.orderWhatsApp")}
                  </a>

                  <button
                    onClick={handleAdd}
                    className="w-full flex items-center justify-center gap-2 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-medium py-3 rounded-lg transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {t("product.addToCart")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

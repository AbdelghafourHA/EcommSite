// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/stores/cartStore";

export default function ProductCard({ product }) {
  const { lang } = useLang();
  const addItem = useCartStore((s) => s.addItem);

  const title = product.title?.[lang] || product.title?.en || "—";
  const image = product.images?.[0] || "";
  const inStock = product.inStock;
  const hasDiscount = product.discount > 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, 1);
  };

  return (
    <Link
      to={`/${lang}/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-primary-300 hover:shadow-md transition"
    >
      {/* Image */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
            🛍️
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 start-2 bg-danger text-white text-xs font-bold px-2 py-1 rounded-md">
            -{product.discount}%
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-md">
              {lang === "ar"
                ? "غير متوفر"
                : lang === "fr"
                ? "Épuisé"
                : "Out of stock"}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-stone-900 line-clamp-2 mb-2 min-h-[2.5rem]">
          {title}
        </h3>

        <div className="flex items-end justify-between gap-2">
          <div>
            {hasDiscount ? (
              <>
                <div className="text-primary-600 font-bold">
                  {formatCurrency(product.discountedPrice, lang)}
                </div>
                <div className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.price, lang)}
                </div>
              </>
            ) : (
              <div className="text-primary-600 font-bold">
                {formatCurrency(product.price, lang)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

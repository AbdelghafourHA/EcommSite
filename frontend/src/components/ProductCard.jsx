// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { ShoppingCart, Plus } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "@/components/Toast";

export default function ProductCard({ product }) {
  const { lang } = useLang();
  const addItem = useCartStore((s) => s.addItem);

  const title = product.title?.[lang] || product.title?.en || "—";
  const image = product.images?.[0] || "";
  const inStock = product.inStock;
  const hasDiscount = product.discount > 0;
  const isNew =
    new Date(product.createdAt) >
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, 1);
    toast.success(
      lang === "ar"
        ? "تمت الإضافة للسلة"
        : lang === "fr"
        ? "Ajouté au panier"
        : "Added to cart"
    );
  };

  return (
    <Link
      to={`/${lang}/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
            🛍️
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
              -{product.discount}%
            </span>
          )}
          {isNew && !hasDiscount && (
            <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-stone-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide">
              {lang === "ar"
                ? "نفذت الكمية"
                : lang === "fr"
                ? "Épuisé"
                : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Quick Add Button (Appears on Hover) */}
        {inStock && (
          <button
            onClick={handleAdd}
            className="absolute bottom-3 end-3 p-2.5 bg-primary-500 text-white rounded-full shadow-md opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-600"
            aria-label="Quick add to cart"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-stone-900 line-clamp-2 mb-1.5 group-hover:text-primary-600 transition">
            {title}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div>
            {hasDiscount ? (
              <>
                <div className="text-primary-600 font-bold text-base">
                  {formatCurrency(product.discountedPrice, lang)}
                </div>
                <div className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.price, lang)}
                </div>
              </>
            ) : (
              <div className="text-primary-600 font-bold text-base">
                {formatCurrency(product.price, lang)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

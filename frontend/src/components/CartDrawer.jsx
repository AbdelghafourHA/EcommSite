// src/components/CartDrawer.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";

export default function CartDrawer() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const open = useUIStore((s) => s.cartOpen);
  const close = useUIStore((s) => s.closeCart);
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const total = items.reduce((sum, i) => {
    const unit = i.product.discountedPrice ?? i.product.price ?? 0;
    return sum + unit * i.quantity;
  }, 0);

  const whatsappUrl = buildCartWhatsAppUrl(items, lang);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={close} />

      <aside
        className="fixed top-0 end-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t("cart.title")}
          </h2>
          <button
            onClick={close}
            className="p-2 rounded-md hover:bg-stone-100"
            aria-label={t("common.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="font-semibold mb-1">{t("cart.empty")}</h3>
              <p className="text-sm text-stone-500 mb-4">
                {t("cart.emptyMessage")}
              </p>
              <button
                onClick={close}
                className="text-primary-600 font-medium text-sm hover:underline"
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(({ product, quantity }) => {
                const title = product.title?.[lang] || product.title?.en || "—";
                const image = product.images?.[0] || "";
                const unit = product.discountedPrice ?? product.price ?? 0;

                return (
                  <li
                    key={product._id}
                    className="flex gap-3 p-2 rounded-lg hover:bg-stone-50"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-stone-300">
                          🛍️
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/${lang}/products/${product.slug}`}
                        onClick={close}
                        className="font-medium text-sm line-clamp-1 hover:text-primary-600"
                      >
                        {title}
                      </Link>
                      <div className="text-sm text-primary-600 font-bold mt-0.5">
                        {formatCurrency(unit * quantity, lang)}
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center border border-stone-200 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(product._id, quantity - 1)
                            }
                            className="px-2 py-0.5 text-sm hover:bg-stone-50"
                          >
                            −
                          </button>
                          <span className="px-3 text-sm min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product._id, quantity + 1)
                            }
                            className="px-2 py-0.5 text-sm hover:bg-stone-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(product._id)}
                          className="p-1.5 text-stone-400 hover:text-danger rounded"
                          aria-label={t("cart.remove")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("cart.total")}</span>
              <span className="font-bold text-primary-600 text-lg">
                {formatCurrency(total, lang)}
              </span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
            >
              <MessageCircle className="w-5 h-5" />
              {t("cart.checkout")}
            </a>

            <div className="flex gap-2">
              <Link
                to={`/${lang}/cart`}
                onClick={close}
                className="flex-1 text-center text-sm py-2 border border-stone-200 rounded-md hover:bg-stone-50"
              >
                {t("cart.title")}
              </Link>
              <button
                onClick={clearCart}
                className="px-3 py-2 text-sm text-danger border border-stone-200 rounded-md hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

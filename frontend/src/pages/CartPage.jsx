// src/pages/CartPage.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Trash2, MessageCircle, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { buildCartWhatsAppUrl } from "@/lib/whatsapp";
import EmptyState from "@/components/EmptyState";

export default function CartPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const total = items.reduce((sum, i) => {
    const unit = i.product.discountedPrice ?? i.product.price ?? 0;
    return sum + unit * i.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-stone-400" />}
          title={t("cart.empty")}
          message={t("cart.emptyMessage")}
          action={
            <Link
              to={`/${lang}/products`}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2.5 rounded-lg transition"
            >
              {t("cart.continueShopping")}
              <ArrowRight className="w-4 h-4 flip-rtl" />
            </Link>
          }
        />
      </div>
    );
  }

  const whatsappUrl = buildCartWhatsAppUrl(items, lang);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-6">
        {t("cart.title")}
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Items list */}
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-200">
          {items.map(({ product, quantity }) => {
            const title = product.title?.[lang] || product.title?.en || "—";
            const image = product.images?.[0] || "";
            const unit = product.discountedPrice ?? product.price ?? 0;
            const hasDiscount = product.discount > 0;

            return (
              <div key={product._id} className="p-4 flex gap-4">
                <Link
                  to={`/${lang}/products/${product.slug}`}
                  className="w-24 h-24 rounded-lg overflow-hidden bg-stone-100 shrink-0"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-stone-300">
                      🛍️
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/${lang}/products/${product.slug}`}
                    className="font-semibold hover:text-primary-600 line-clamp-2"
                  >
                    {title}
                  </Link>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-primary-600 font-bold">
                      {formatCurrency(unit, lang)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-stone-400 line-through">
                        {formatCurrency(product.price, lang)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-200 rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(product._id, quantity - 1)
                        }
                        className="px-3 py-1 text-sm hover:bg-stone-50"
                      >
                        −
                      </button>
                      <span className="px-4 text-sm min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product._id, quantity + 1)
                        }
                        className="px-3 py-1 text-sm hover:bg-stone-50"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-end">
                        <div className="text-sm font-bold">
                          {formatCurrency(unit * quantity, lang)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(product._id)}
                        className="p-2 text-stone-400 hover:text-danger rounded"
                        aria-label={t("cart.remove")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="p-3 flex justify-end">
            <button
              onClick={clearCart}
              className="text-sm text-danger hover:underline"
            >
              {t("common.delete")} — {t("cart.title")}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 h-fit sticky top-20">
          <h2 className="font-heading font-bold text-lg mb-4">
            {t("cart.total")}
          </h2>

          <div className="space-y-2 text-sm pb-4 border-b border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-600">{t("cart.subtotal")}</span>
              <span className="font-medium">{formatCurrency(total, lang)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mt-4 mb-6">
            <span className="font-bold">{t("cart.total")}</span>
            <span className="font-bold text-2xl text-primary-600">
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

          <Link
            to={`/${lang}/products`}
            className="block text-center text-sm text-stone-600 hover:text-primary-600 mt-3"
          >
            {t("cart.continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}

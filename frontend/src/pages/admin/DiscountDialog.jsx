// src/pages/admin/DiscountDialog.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/Modal";
import { useSetProductDiscount } from "@/hooks/useProductMutations";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/Toast";
import { useLang } from "@/hooks/useLang";

export default function DiscountDialog({ product, onClose }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const mutation = useSetProductDiscount();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (product) setValue(product.discount ?? 0);
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    const discount = Math.max(0, Math.min(100, Number(value) || 0));
    mutation.mutate(
      { id: product._id, discount },
      {
        onSuccess: () => {
          toast.success(
            lang === "ar"
              ? `تم تطبيق خصم ${discount}%`
              : lang === "fr"
              ? `Remise de ${discount}% appliquée`
              : `Discount of ${discount}% applied`
          );
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title={t("admin.discount")}
      size="sm"
    >
      {mutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{mutation.error?.message}</span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-stone-600 mb-3">
          {product?.title?.[lang] || product?.title?.en || "—"}
        </p>
        <label className="block text-sm font-medium mb-1.5">
          {t("admin.discount")} (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none"
        />
        <p className="text-xs text-stone-500 mt-2">
          0 = {t("common.no")} · 100 = FREE
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-2 text-sm border border-stone-200 rounded-md hover:bg-stone-50"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md disabled:opacity-50"
        >
          {mutation.isPending ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </Modal>
  );
}

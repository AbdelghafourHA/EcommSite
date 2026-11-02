// src/pages/admin/CategoryForm.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/Modal";
import { AlertCircle } from "lucide-react";

export default function CategoryForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  isSubmitting,
  error,
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialData);

  useEffect(() => {
    if (open) setValues(initialData);
  }, [open, initialData]);

  const handleChange = (path, value) => {
    setValues((prev) => {
      const next = { ...prev };
      if (path.includes(".")) {
        const [parent, child] = path.split(".");
        next[parent] = { ...next[parent], [child]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t("admin.editCategory") : t("admin.addCategory")}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.nameAr")}
            </label>
            <input
              required
              dir="rtl"
              value={values.name.ar}
              onChange={(e) => handleChange("name.ar", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.nameFr")}
            </label>
            <input
              required
              dir="ltr"
              value={values.name.fr}
              onChange={(e) => handleChange("name.fr", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.nameEn")}
            </label>
            <input
              required
              dir="ltr"
              value={values.name.en}
              onChange={(e) => handleChange("name.en", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Emoji + Order */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.emoji")}
            </label>
            <input
              value={values.emoji}
              onChange={(e) => handleChange("emoji", e.target.value)}
              maxLength={4}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-center text-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.order")}
            </label>
            <input
              type="number"
              min="0"
              value={values.order}
              onChange={(e) => handleChange("order", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Active */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm font-medium">{t("admin.isActive")}</span>
        </label>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm border border-stone-200 rounded-md hover:bg-stone-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md disabled:opacity-50"
          >
            {isSubmitting ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

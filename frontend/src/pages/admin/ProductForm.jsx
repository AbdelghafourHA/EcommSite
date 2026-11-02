// src/pages/admin/ProductForm.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, X, Upload, ImagePlus } from "lucide-react";
import Modal from "@/components/Modal";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProductMutations";
import { toast } from "@/components/Toast";
import { useLang } from "@/hooks/useLang";

const EMPTY = {
  title: { ar: "", fr: "", en: "" },
  description: { ar: "", fr: "", en: "" },
  price: "",
  discount: 0,
  stock: "", // ← empty — forces admin to enter a number
  isAvailable: true,
  category: "",
  tags: "",
};

export default function ProductForm({ open, onClose, editing }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { data: catsData } = useCategories({ activeOnly: true });
  const categories = catsData?.categories || [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error?.message || updateMutation.error?.message;

  const [values, setValues] = useState(EMPTY);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setValues({
        title: { ...EMPTY.title, ...(editing.title || {}) },
        description: { ...EMPTY.description, ...(editing.description || {}) },
        price: editing.price ?? "",
        discount: editing.discount ?? 0,
        stock: editing.stock ?? "",
        isAvailable: editing.isAvailable ?? true,
        category: editing.category?._id || editing.category || "",
        tags: (editing.tags || []).join(", "),
      });
      setExistingImages(editing.images || []);
    } else {
      setValues(EMPTY);
      setExistingImages([]);
    }
    setRemovedImages([]);
    setNewFiles([]);
    setPreviews([]);
  }, [open, editing]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 8 - existingImages.length - newFiles.length;
    const toAdd = files.slice(0, Math.max(0, remaining));
    setNewFiles((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editing && existingImages.length === 0 && newFiles.length === 0) {
      toast.error(
        lang === "ar"
          ? "يجب إضافة صورة واحدة على الأقل"
          : lang === "fr"
          ? "Au moins une image est requise"
          : "At least one image is required"
      );
      return;
    }

    // Extra guard: stock must be a valid number
    if (values.stock === "" || Number(values.stock) < 0) {
      toast.error(
        lang === "ar"
          ? "يجب إدخال كمية مخزون صحيحة"
          : lang === "fr"
          ? "Veuillez saisir une quantité de stock valide"
          : "Please enter a valid stock quantity"
      );
      return;
    }

    const fd = new FormData();
    fd.append("title", JSON.stringify(values.title));
    fd.append("description", JSON.stringify(values.description));
    fd.append("price", String(values.price));
    fd.append("discount", String(values.discount));
    fd.append("stock", String(values.stock));
    fd.append("isAvailable", String(values.isAvailable));
    fd.append("category", values.category);

    const tags = values.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (tags.length > 0) fd.append("tags", JSON.stringify(tags));

    newFiles.forEach((file) => fd.append("images", file));

    if (editing && removedImages.length > 0) {
      fd.append("removeImages", JSON.stringify(removedImages));
    }

    if (editing) {
      updateMutation.mutate(
        { id: editing._id, formData: fd },
        {
          onSuccess: () => {
            toast.success(
              lang === "ar"
                ? "تم تحديث المنتج"
                : lang === "fr"
                ? "Produit mis à jour"
                : "Product updated"
            );
            onClose();
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createMutation.mutate(fd, {
        onSuccess: () => {
          toast.success(
            lang === "ar"
              ? "تمت إضافة المنتج"
              : lang === "fr"
              ? "Produit créé"
              : "Product created"
          );
          onClose();
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t("admin.editProduct") : t("admin.addProduct")}
      size="xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            {t("admin.nameAr")} / {t("admin.nameFr")} / {t("admin.nameEn")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              required
              dir="rtl"
              placeholder={t("admin.nameAr")}
              value={values.title.ar}
              onChange={(e) => handleChange("title.ar", e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            />
            <input
              required
              dir="ltr"
              placeholder={t("admin.nameFr")}
              value={values.title.fr}
              onChange={(e) => handleChange("title.fr", e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            />
            <input
              required
              dir="ltr"
              placeholder={t("admin.nameEn")}
              value={values.title.en}
              onChange={(e) => handleChange("title.en", e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            {t("product.description")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <textarea
              dir="rtl"
              rows={3}
              placeholder={t("admin.nameAr")}
              value={values.description.ar}
              onChange={(e) => handleChange("description.ar", e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm resize-none"
            />
            <textarea
              dir="ltr"
              rows={3}
              placeholder={t("admin.nameFr")}
              value={values.description.fr}
              onChange={(e) => handleChange("description.fr", e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm resize-none"
            />
            <textarea
              dir="ltr"
              rows={3}
              placeholder={t("admin.nameEn")}
              value={values.description.en}
              onChange={(e) => handleChange("description.en", e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.categories")}
            </label>
            <select
              required
              value={values.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.emoji} {c.name?.en || c.slug}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.price")} (DZD)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.discount")} %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.discount}
              onChange={(e) => handleChange("discount", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("admin.stock")}
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              value={values.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
            />
            <p className="text-xs text-stone-500 mt-1">
              {lang === "ar"
                ? "0 = غير متوفر في المتجر"
                : lang === "fr"
                ? "0 = épuisé sur la boutique"
                : "0 = shown as out of stock on the store"}
            </p>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={values.isAvailable}
                onChange={(e) => handleChange("isAvailable", e.target.checked)}
                className="w-4 h-4 accent-primary-500"
              />
              <span className="text-sm font-medium">
                {t("admin.isAvailable")}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            value={values.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="pizza, cheese, hot"
            className="w-full px-3 py-2 border border-stone-200 rounded-md focus:border-primary-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              {t("admin.images")} ({totalImages}/8)
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={totalImages >= 8}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              <ImagePlus className="w-4 h-4" />
              {t("admin.uploadImages")}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {existingImages.map((url) => (
              <div
                key={url}
                className="relative aspect-square bg-stone-100 rounded-md overflow-hidden group"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 end-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {previews.map((url, i) => (
              <div
                key={`new-${i}`}
                className="relative aspect-square bg-stone-100 rounded-md overflow-hidden group"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 end-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {totalImages === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-300 rounded-md flex flex-col items-center justify-center text-stone-400 hover:border-primary-400 hover:text-primary-600 transition col-span-2"
              >
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Upload</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-stone-200">
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

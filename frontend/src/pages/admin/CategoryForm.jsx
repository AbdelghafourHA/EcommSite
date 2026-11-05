// src/pages/admin/CategoryForm.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/Modal";
import { AlertCircle, X, Upload, ImagePlus } from "lucide-react";

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
  const [existingImage, setExistingImage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removedImage, setRemovedImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setValues(initialData);
    setExistingImage(initialData.image || "");
    setNewFile(null);
    setPreview("");
    setRemovedImage(false);
  }, [open, initialData]);

  useEffect(() => {
    if (!newFile) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(newFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newFile]);

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
    const file = e.target.files?.[0];
    if (file) setNewFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setNewFile(null);
    setPreview("");
    if (existingImage) {
      setExistingImage("");
      setRemovedImage(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...values,
      imageFile: newFile || undefined,
      removeImage: removedImage,
    });
  };

  const hasImage = preview || existingImage;

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
        {/* Image uploader */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("admin.image") || "Image"}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {hasImage ? (
            <div className="relative w-full aspect-video bg-stone-100 rounded-lg overflow-hidden group">
              <img
                src={preview || existingImage}
                alt="Category"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 end-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 end-2 px-3 py-1.5 bg-white/90 backdrop-blur text-stone-800 text-xs font-medium rounded-md hover:bg-white transition flex items-center gap-1.5"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {t("common.edit")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:border-primary-400 hover:text-primary-600 transition"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">
                {t("admin.uploadImages") || "Upload image"}
              </span>
              <span className="text-xs mt-1">
                {t("common.recommended") || "Recommended: 800×800 or larger"}
              </span>
            </button>
          )}
        </div>

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
            <p className="text-[10px] text-stone-500 mt-1">
              {t("common.fallback") || "Fallback when no image"}
            </p>
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

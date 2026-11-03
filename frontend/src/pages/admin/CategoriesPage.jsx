// src/pages/admin/CategoriesPage.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategoryMutations";
import CategoryForm from "./CategoryForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/components/Toast";

const EMPTY_CATEGORY = {
  name: { ar: "", fr: "", en: "" },
  emoji: "🍽️",
  order: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { data, isLoading } = useCategories();
  const categories = data?.categories || [];

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      emoji: values.emoji,
      order: Number(values.order),
      isActive: values.isActive,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing._id, payload },
        {
          onSuccess: () => {
            toast.success(
              lang === "ar"
                ? "تم تحديث الفئة"
                : lang === "fr"
                ? "Catégorie mise à jour"
                : "Category updated"
            );
            closeModal();
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(
            lang === "ar"
              ? "تمت إضافة الفئة"
              : lang === "fr"
              ? "Catégorie créée"
              : "Category created"
          );
          closeModal();
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting._id, {
      onSuccess: () => {
        toast.success(
          lang === "ar"
            ? "تم حذف الفئة"
            : lang === "fr"
            ? "Catégorie supprimée"
            : "Category deleted"
        );
        setDeleting(null);
      },
      onError: (err) => {
        toast.error(err.message);
        setDeleting(null);
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl truncate">
            {t("admin.categories")}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {categories.length}{" "}
            {lang === "ar"
              ? "فئة"
              : lang === "fr"
              ? "catégories"
              : "categories"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="shrink-0 flex items-center gap-1.5 sm:gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-3 sm:px-4 py-2 text-sm rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("admin.addCategory")}</span>
          <span className="sm:hidden">
            {lang === "ar" ? "إضافة" : lang === "fr" ? "Ajouter" : "Add"}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-stone-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-3">📁</div>
          <p className="text-stone-500 mb-4 text-sm">
            {lang === "ar"
              ? "لا توجد فئات بعد"
              : lang === "fr"
              ? "Aucune catégorie"
              : "No categories yet"}
          </p>
          <button
            onClick={openCreate}
            className="text-primary-600 font-medium hover:underline text-sm"
          >
            {t("admin.addCategory")}
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white border border-stone-200 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{cat.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {cat.name?.[lang] || cat.name?.en || "—"}
                      </div>
                      <div className="text-xs text-stone-400 font-mono truncate">
                        {cat.slug}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      cat.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {cat.isActive ? "✓" : "✗"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-xs text-stone-500">
                    {t("admin.order")}: <strong>{cat.order}</strong>
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-stone-500 hover:text-primary-600 hover:bg-stone-100 rounded"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(cat)}
                      className="p-2 text-stone-500 hover:text-danger hover:bg-red-50 rounded"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    {t("admin.name")}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    {t("admin.slug")}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    {t("admin.order")}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    {t("admin.isActive")}
                  </th>
                  <th className="text-end px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="font-medium">
                          {cat.name?.[lang] || cat.name?.en || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500 font-mono">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {cat.order}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          cat.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {cat.isActive ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 text-stone-500 hover:text-primary-600 hover:bg-stone-100 rounded"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(cat)}
                          className="p-2 text-stone-500 hover:text-danger hover:bg-red-50 rounded"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CategoryForm
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editing || EMPTY_CATEGORY}
        isEditing={Boolean(editing)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        error={
          createMutation.error?.message || updateMutation.error?.message || null
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t("common.delete")}
        message={
          lang === "ar"
            ? `هل أنت متأكد من حذف "${deleting?.name?.ar || ""}"؟`
            : lang === "fr"
            ? `Supprimer "${deleting?.name?.fr || ""}" ?`
            : `Delete "${deleting?.name?.en || ""}"?`
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

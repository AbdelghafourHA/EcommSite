// src/pages/admin/ProductsPage.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Percent,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useProducts } from "@/hooks/useProducts";
import {
  useDeleteProduct,
  useToggleAvailability,
} from "@/hooks/useProductMutations";
import { formatCurrency } from "@/lib/formatCurrency";
import ProductForm from "./ProductForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import DiscountDialog from "./DiscountDialog";
import { toast } from "@/components/Toast";

export default function ProductsPage() {
  const { t } = useTranslation();
  const { lang } = useLang();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
  });

  const products = data?.products || [];
  const pagination = data?.pagination;

  const deleteMutation = useDeleteProduct();
  const toggleMutation = useToggleAvailability();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [discountTarget, setDiscountTarget] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting._id, {
      onSuccess: () => {
        toast.success(
          lang === "ar"
            ? "تم حذف المنتج"
            : lang === "fr"
            ? "Produit supprimé"
            : "Product deleted"
        );
        setDeleting(null);
      },
      onError: (err) => {
        toast.error(err.message);
        setDeleting(null);
      },
    });
  };

  const handleToggle = (id) => {
    toggleMutation.mutate(id, {
      onSuccess: () => {
        toast.success(
          lang === "ar"
            ? "تم تحديث حالة التوفر"
            : lang === "fr"
            ? "Disponibilité mise à jour"
            : "Availability updated"
        );
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl">
            {t("admin.products")}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {data?.total ?? 0}{" "}
            {lang === "ar" ? "منتج" : lang === "fr" ? "produits" : "products"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          {t("admin.addProduct")}
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative max-w-sm">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("common.search")}
            className="w-full px-4 py-2 ps-10 border border-stone-200 rounded-lg focus:border-primary-500 focus:outline-none"
          />
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-stone-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-stone-500 mb-4">
            {lang === "ar"
              ? "لا توجد منتجات بعد"
              : lang === "fr"
              ? "Aucun produit"
              : "No products yet"}
          </p>
          <button
            onClick={openCreate}
            className="text-primary-600 font-medium hover:underline"
          >
            {t("admin.addProduct")}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                      {t("admin.nameAr")}
                    </th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                      {t("admin.price")}
                    </th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                      {t("admin.stock")}
                    </th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                      {t("admin.isAvailable")}
                    </th>
                    <th className="text-end px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                      {lang === "ar"
                        ? "الإجراءات"
                        : lang === "fr"
                        ? "Actions"
                        : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const title = p.title?.[lang] || p.title?.en || "—";
                    return (
                      <tr key={p._id} className="hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-stone-100 shrink-0">
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium line-clamp-1">
                                {title}
                              </div>
                              <div className="text-xs text-stone-400 font-mono line-clamp-1">
                                {p.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {p.discount > 0 ? (
                            <div>
                              <div className="font-semibold text-primary-600">
                                {formatCurrency(p.discountedPrice, lang)}
                              </div>
                              <div className="text-xs text-stone-400 line-through">
                                {formatCurrency(p.price, lang)}
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {formatCurrency(p.price, lang)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={
                              p.stock > 0
                                ? "text-stone-700"
                                : "text-danger font-medium"
                            }
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggle(p._id)}
                            disabled={toggleMutation.isPending}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition ${
                              p.isAvailable
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                            }`}
                          >
                            {p.isAvailable ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {p.isAvailable ? "✓" : "✗"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setDiscountTarget(p)}
                              className="p-2 text-stone-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                              aria-label="Discount"
                            >
                              <Percent className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 text-stone-500 hover:text-primary-600 hover:bg-stone-100 rounded"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleting(p)}
                              className="p-2 text-stone-500 hover:text-danger hover:bg-red-50 rounded"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-sm border border-stone-200 rounded-md disabled:opacity-40"
              >
                {t("common.previous")}
              </button>
              <span className="px-3 py-2 text-sm text-stone-600">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-sm border border-stone-200 rounded-md disabled:opacity-40"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}

      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t("common.delete")}
        message={
          lang === "ar"
            ? `هل أنت متأكد من حذف "${deleting?.title?.ar || ""}"؟`
            : lang === "fr"
            ? `Supprimer "${deleting?.title?.fr || ""}" ?`
            : `Delete "${deleting?.title?.en || ""}"?`
        }
        isLoading={deleteMutation.isPending}
      />

      <DiscountDialog
        product={discountTarget}
        onClose={() => setDiscountTarget(null)}
      />
    </div>
  );
}

// src/components/ConfirmDialog.jsx
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDanger = true,
  isLoading = false,
}) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={title || "Confirm"} size="sm">
      <div className="flex items-start gap-3 mb-6">
        {isDanger && (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        )}
        <p className="text-sm text-stone-600 leading-relaxed">{message}</p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-stone-200 rounded-md hover:bg-stone-50"
        >
          {cancelLabel || t("common.cancel")}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm rounded-md text-white font-medium ${
            isDanger
              ? "bg-danger hover:bg-red-600"
              : "bg-primary-500 hover:bg-primary-600"
          } disabled:opacity-50`}
        >
          {isLoading ? t("common.loading") : confirmLabel || t("common.delete")}
        </button>
      </div>
    </Modal>
  );
}

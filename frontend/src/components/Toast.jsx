// src/components/Toast.jsx
import { create } from "zustand";
import { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

/* ── Store ── */
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration ?? 3500);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message) =>
    useToastStore.getState().addToast({ type: "success", message }),
  error: (message) =>
    useToastStore.getState().addToast({ type: "error", message }),
  info: (message) =>
    useToastStore.getState().addToast({ type: "info", message }),
};

/* ── Component ── */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 start-1/2 -translate-x-1/2 z-[100] space-y-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    // Auto-handled by store; no timer here
  }, []);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const Icon = toast.type === "error" ? AlertCircle : CheckCircle;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2 p-3 rounded-lg border shadow-lg ${
        styles[toast.type] || styles.info
      }`}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button onClick={onClose} className="p-0.5 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

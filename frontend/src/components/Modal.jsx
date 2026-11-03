// src/components/Modal.jsx
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative bg-white sm:rounded-xl shadow-2xl w-full ${sizes[size]} h-full sm:h-auto sm:max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-200 shrink-0">
          <h2 className="font-heading font-bold text-base sm:text-lg truncate pe-3">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -me-1.5 rounded-md hover:bg-stone-100 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

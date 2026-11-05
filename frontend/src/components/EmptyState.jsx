// src/components/EmptyState.jsx
import { PackageOpen } from "lucide-react";

export default function EmptyState({ title, message, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-5">
        {icon || <PackageOpen className="w-10 h-10 text-stone-300" />}
      </div>
      <h3 className="font-heading font-bold text-xl text-stone-900 mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-stone-500 text-sm mb-6 max-w-sm">{message}</p>
      )}
      {action}
    </div>
  );
}

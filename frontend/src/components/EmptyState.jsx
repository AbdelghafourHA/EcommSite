// src/components/EmptyState.jsx
import { Inbox } from "lucide-react";

export default function EmptyState({ title, message, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-stone-400" />}
      </div>
      <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-stone-500 text-sm mb-6 max-w-sm">{message}</p>
      )}
      {action}
    </div>
  );
}

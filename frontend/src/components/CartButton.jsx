// src/components/CartButton.jsx
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";

export default function CartButton() {
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const openCart = useUIStore((s) => s.openCart);

  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-md hover:bg-stone-100 transition"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-[1.25rem] h-5 px-1 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}

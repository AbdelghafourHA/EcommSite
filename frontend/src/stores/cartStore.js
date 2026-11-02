// src/stores/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart item shape: { product, quantity }
 * Product must include _id, title {ar,fr,en}, price, discountedPrice, images, slug
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product._id === product._id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.product._id === product._id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product._id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, i) => {
          const unit = i.product.discountedPrice ?? i.product.price ?? 0;
          return sum + unit * i.quantity;
        }, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

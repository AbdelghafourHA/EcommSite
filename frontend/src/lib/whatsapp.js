// src/lib/whatsapp.js
import { formatCurrency } from "./formatCurrency";

const getGreeting = (lang) => {
  const greetings = {
    ar: "مرحبا، أريد طلب:",
    fr: "Bonjour, je souhaite commander :",
    en: "Hello, I'd like to order:",
  };
  return greetings[lang] || greetings.en;
};

const getTotalLabel = (lang) => {
  const labels = {
    ar: "المجموع",
    fr: "Total",
    en: "Total",
  };
  return labels[lang] || labels.en;
};

const getProductTitle = (product, lang) =>
  product?.title?.[lang] || product?.title?.en || "—";

/**
 * Build a wa.me URL for ordering a single product.
 */
export const buildSingleProductUrl = (product, lang, qty = 1) => {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (!phone) {
    console.warn("VITE_WHATSAPP_NUMBER is not set in .env");
    return "#";
  }

  const title = getProductTitle(product, lang);
  const unitPrice = product?.discountedPrice ?? product?.price ?? 0;
  const lineTotal = unitPrice * qty;

  const lines = [
    getGreeting(lang),
    "",
    `• ${title} × ${qty} — ${formatCurrency(lineTotal, lang)}`,
    "",
    `${getTotalLabel(lang)}: ${formatCurrency(lineTotal, lang)}`,
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
};

/**
 * Build a wa.me URL for a full cart.
 * items: [{ product, quantity }]
 */
export const buildCartWhatsAppUrl = (items, lang) => {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (!phone) {
    console.warn("VITE_WHATSAPP_NUMBER is not set in .env");
    return "#";
  }

  const lines = [getGreeting(lang), ""];
  let total = 0;

  items.forEach(({ product, quantity }) => {
    const title = getProductTitle(product, lang);
    const unitPrice = product?.discountedPrice ?? product?.price ?? 0;
    const lineTotal = unitPrice * quantity;
    total += lineTotal;
    lines.push(`• ${title} × ${quantity} — ${formatCurrency(lineTotal, lang)}`);
  });

  lines.push("");
  lines.push(`${getTotalLabel(lang)}: ${formatCurrency(total, lang)}`);

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
};

// src/lib/formatCurrency.js
const LOCALE_MAP = {
  ar: "ar-DZ",
  fr: "fr-DZ",
  en: "en-US",
};

/**
 * Format a number as DZD currency.
 * ar → "1.200,00 د.ج"
 * fr → "1 200,00 DZD"
 * en → "1,200.00 DZD"
 */
export const formatCurrency = (amount, lang = "ar") => {
  const value = Number(amount) || 0;
  const locale = LOCALE_MAP[lang] || "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} DZD`;
  }
};

/**
 * Format a plain number (no currency) with locale separators.
 */
export const formatNumber = (value, lang = "ar") => {
  const locale = LOCALE_MAP[lang] || "en-US";
  return new Intl.NumberFormat(locale).format(Number(value) || 0);
};

// utils/slugify.js
import slugifyLib from "slugify";

/**
 * Convert a localized title (ar/fr/en) into a clean ASCII slug.
 * Falls back to English → French → Arabic if a field is missing.
 * Handles Arabic characters by transliterating what slugify can, then stripping non-ASCII.
 */
export const makeSlug = (input) => {
  if (!input) return "";

  // Accept either a string or a localized object { ar, fr, en }
  const raw =
    typeof input === "string" ? input : input.en || input.fr || input.ar || "";

  return slugifyLib(raw, {
    lower: true,
    strict: true, // strips all non-ASCII, including Arabic glyphs
    trim: true,
  });
};

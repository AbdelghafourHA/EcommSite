// src/hooks/useProducts.js
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductBySlug,
  fetchFeaturedProducts,
} from "@/api/products";

/**
 * useProducts — paginated product list with filters.
 *
 * IMPORTANT: We do NOT use `keepPreviousData` here. When the filter changes
 * (category, search, sort, page), React Query returns `isLoading: true`
 * and `data: undefined` until the new fetch completes, so the UI can show
 * skeletons instead of stale products from the previous filter.
 */
export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    // Default behavior: refetch when queryKey changes, show loading state
    // (no placeholderData — that's the key change)
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useProductBySlug = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });
};

export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ["featured-products", limit],
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Optional helper for cases where you WANT to keep previous data
 * (e.g. pagination of the same list — you don't want to flash a skeleton
 * when moving from page 1 to page 2 of the same category).
 *
 * Usage: useProductsWithPagination({ page: 2, category: "x" })
 */
export const useProductsWithPagination = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

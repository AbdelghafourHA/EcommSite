// src/hooks/useProducts.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductBySlug,
  fetchFeaturedProducts,
} from "@/api/products";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    // NO placeholderData, NO keepPreviousData — clean state on key change
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

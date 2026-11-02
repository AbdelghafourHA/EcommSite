// src/hooks/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchCategoryBySlug } from "@/api/categories";

export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: ["categories", options],
    queryFn: () => fetchCategories(options),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryBySlug = (slug) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => fetchCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
};

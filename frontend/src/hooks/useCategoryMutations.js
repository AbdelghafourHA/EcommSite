// src/hooks/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories";

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["category"] });
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// src/hooks/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories";

/* -------------------------------------------------------------------------- */
/*                              Create                                        */
/* -------------------------------------------------------------------------- */
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Force refetch everywhere, even if staleTime hasn't expired
      qc.invalidateQueries({
        queryKey: ["categories"],
        refetchType: "all",
      });
    },
  });
};

/* -------------------------------------------------------------------------- */
/*                              Update                                        */
/* -------------------------------------------------------------------------- */
export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: (updatedCategory) => {
      // 1. Optimistically update the cached list with the new data
      qc.setQueriesData({ queryKey: ["categories"] }, (oldData) => {
        if (!oldData?.categories) return oldData;
        return {
          ...oldData,
          categories: oldData.categories.map((c) =>
            c._id === updatedCategory._id ? updatedCategory : c
          ),
        };
      });

      // 2. Also update the single-category cache
      qc.setQueryData(["category", updatedCategory.slug], updatedCategory);

      // 3. Force a background refetch to be safe (in case of concurrent edits)
      qc.invalidateQueries({
        queryKey: ["categories"],
        refetchType: "all",
      });
      qc.invalidateQueries({
        queryKey: ["category"],
        refetchType: "all",
      });
    },
  });
};

/* -------------------------------------------------------------------------- */
/*                              Delete                                        */
/* -------------------------------------------------------------------------- */
export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["categories"],
        refetchType: "all",
      });
    },
  });
};

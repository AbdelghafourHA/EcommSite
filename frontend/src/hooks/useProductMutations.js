// src/hooks/useProductMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  setProductDiscount,
} from "@/api/products";

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["product"] });
  qc.invalidateQueries({ queryKey: ["featured-products"] });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateProduct(id, formData),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => invalidateAll(qc),
  });
};

export const useToggleAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleAvailability,
    onSuccess: () => invalidateAll(qc),
  });
};

export const useSetProductDiscount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, discount }) => setProductDiscount(id, discount),
    onSuccess: () => invalidateAll(qc),
  });
};

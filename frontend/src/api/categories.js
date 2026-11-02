// src/api/categories.js
import api from "@/lib/api";

export const fetchCategories = async ({ activeOnly = false } = {}) => {
  const { data } = await api.get("/categories", {
    params: activeOnly ? { activeOnly: "true" } : {},
  });
  return data.data; // { count, categories }
};

export const fetchCategoryBySlug = async (slug) => {
  const { data } = await api.get(`/categories/slug/${slug}`);
  return data.data.category;
};

export const fetchCategoryById = async (id) => {
  const { data } = await api.get(`/categories/${id}`);
  return data.data.category;
};

export const createCategory = async (payload) => {
  const { data } = await api.post("/categories", payload);
  return data.data.category;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data.category;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data;
};

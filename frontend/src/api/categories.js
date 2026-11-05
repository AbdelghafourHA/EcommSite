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

/**
 * createCategory accepts:
 *   { name, emoji, order, isActive, imageFile? }
 * If imageFile is provided, sends multipart. Else sends JSON.
 */
export const createCategory = async (payload) => {
  const { imageFile, ...fields } = payload;

  if (imageFile) {
    const fd = new FormData();
    if (fields.name) fd.append("name", JSON.stringify(fields.name));
    if (fields.emoji !== undefined) fd.append("emoji", fields.emoji);
    if (fields.order !== undefined) fd.append("order", String(fields.order));
    if (fields.isActive !== undefined)
      fd.append("isActive", String(fields.isActive));
    fd.append("image", imageFile);

    const { data } = await api.post("/categories", fd);
    return data.data.category;
  }

  const { data } = await api.post("/categories", fields);
  return data.data.category;
};

/**
 * updateCategory accepts:
 *   { name, emoji, order, isActive, imageFile?, removeImage? }
 */
export const updateCategory = async (id, payload) => {
  const { imageFile, removeImage, ...fields } = payload;

  if (imageFile || removeImage) {
    const fd = new FormData();
    if (fields.name) fd.append("name", JSON.stringify(fields.name));
    if (fields.emoji !== undefined) fd.append("emoji", fields.emoji);
    if (fields.order !== undefined) fd.append("order", String(fields.order));
    if (fields.isActive !== undefined)
      fd.append("isActive", String(fields.isActive));
    if (imageFile) fd.append("image", imageFile);
    if (removeImage) fd.append("removeImage", "true");

    const { data } = await api.put(`/categories/${id}`, fd);
    return data.data.category;
  }

  const { data } = await api.put(`/categories/${id}`, fields);
  return data.data.category;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data;
};

// src/api/categories.js
import api from "@/lib/api";

export const fetchCategories = async ({ activeOnly = false } = {}) => {
  const { data } = await api.get("/categories", {
    params: activeOnly ? { activeOnly: "true" } : {},
  });
  return data.data;
};

export const fetchCategoryBySlug = async (slug) => {
  const { data } = await api.get(`/categories/slug/${slug}`);
  return data.data.category;
};

export const fetchCategoryById = async (id) => {
  const { data } = await api.get(`/categories/${id}`);
  return data.data.category;
};

/* -------------------------------------------------------------------------- */
/*                              Create                                        */
/* -------------------------------------------------------------------------- */
export const createCategory = async (payload) => {
  const { imageFile, ...fields } = payload;

  // If there's an image → multipart. Otherwise → JSON.
  if (imageFile instanceof File) {
    const fd = new FormData();
    if (fields.name) fd.append("name", JSON.stringify(fields.name));
    if (fields.description)
      fd.append("description", JSON.stringify(fields.description));
    if (fields.emoji !== undefined) fd.append("emoji", fields.emoji);
    if (fields.order !== undefined) fd.append("order", String(fields.order));
    if (fields.isActive !== undefined)
      fd.append("isActive", String(fields.isActive));
    fd.append("image", imageFile);

    const { data } = await api.post("/categories", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.category;
  }

  const { data } = await api.post("/categories", fields);
  return data.data.category;
};

/* -------------------------------------------------------------------------- */
/*                              Update                                        */
/* -------------------------------------------------------------------------- */
export const updateCategory = async (id, payload) => {
  const { imageFile, removeImage, ...fields } = payload;

  // ALWAYS use FormData when editing — safer because the backend route
  // has multer mounted, and mixing JSON + multipart is fragile.
  const fd = new FormData();

  if (fields.name) fd.append("name", JSON.stringify(fields.name));
  if (fields.description)
    fd.append("description", JSON.stringify(fields.description));
  if (fields.emoji !== undefined) fd.append("emoji", fields.emoji);
  if (fields.order !== undefined) fd.append("order", String(fields.order));
  if (fields.isActive !== undefined)
    fd.append("isActive", String(fields.isActive));

  // Only append image if it's a real File
  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  }

  // Only append removeImage if explicitly true
  if (removeImage === true) {
    fd.append("removeImage", "true");
  }

  const { data } = await api.put(`/categories/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.category;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data;
};

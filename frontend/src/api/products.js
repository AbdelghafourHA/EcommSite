// src/api/products.js
import api from "@/lib/api";

/**
 * fetchProducts accepts any combination of:
 * { page, limit, category, isAvailable, inStock, minPrice, maxPrice, search, sort }
 */
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data.data; // { count, total, products, pagination }
};

export const fetchProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/slug/${slug}`);
  return data.data.product;
};

export const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data.product;
};

export const fetchFeaturedProducts = async (limit = 8) => {
  const { data } = await api.get("/products/featured", { params: { limit } });
  return data.data; // { count, products }
};

/**
 * createProduct expects a FormData with:
 * images (multiple), title (JSON string), description (JSON string),
 * category, price, stock, discount?, hasVariants?, variants?, tags?, seo?
 */
export const createProduct = async (formData) => {
  const { data } = await api.post("/products", formData);
  return data.data.product;
};

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(`/products/${id}`, formData);
  return data.data.product;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data.data;
};

export const toggleAvailability = async (id) => {
  const { data } = await api.patch(`/products/${id}/toggle`);
  return data.data.product;
};

export const setProductDiscount = async (id, discount) => {
  const { data } = await api.patch(`/products/${id}/discount`, { discount });
  return data.data.product;
};

export const deleteProductImage = async (id, imageUrl) => {
  const { data } = await api.delete(`/products/${id}/image`, {
    data: { imageUrl },
  });
  return data.data.product;
};

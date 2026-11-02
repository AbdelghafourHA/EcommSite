// controllers/product.controller.js
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { makeSlug } from "../utils/slugify.js";

/* ========================================================================== */
/*                              Helpers                                       */
/* ========================================================================== */

const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length !== 2) return null;
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const uploadBufferToCloudinary = async (
  file,
  folder = "ecommerce/products"
) => {
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
    quality: "auto:good",
    fetch_format: "auto",
  });
  return result.secure_url;
};

const deleteCloudinaryByUrl = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed for", publicId, err.message);
  }
};

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || "product";
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.exists(query);
    if (!exists) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

const parseMaybeJSON = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new ApiError(400, `Invalid JSON in field "${fieldName}"`);
  }
};

/**
 * Compute virtuals explicitly and attach to a plain object.
 * Why: `.lean({ virtuals: true })` is unreliable in Mongoose 8,
 * especially after `.populate()`. This function guarantees the
 * frontend receives `inStock`, `discountedPrice`, and `id`.
 */
const serializeProduct = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };

  // discountedPrice
  if (!obj.discount || obj.discount <= 0) {
    obj.discountedPrice = obj.price;
  } else {
    obj.discountedPrice =
      Math.round(obj.price * (1 - obj.discount / 100) * 100) / 100;
  }

  // inStock
  if (!obj.isAvailable) {
    obj.inStock = false;
  } else if (obj.hasVariants) {
    obj.inStock = Array.isArray(obj.variants)
      ? obj.variants.some((v) => v.stock > 0)
      : false;
  } else {
    obj.inStock = obj.stock > 0;
  }

  // id (for consistency with toJSON)
  if (!obj.id && obj._id) {
    obj.id = obj._id.toString();
  }

  return obj;
};

/* ========================================================================== */
/*                              GET /api/products                             */
/* ========================================================================== */
export const getProducts = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.category) {
    if (!mongoose.isValidObjectId(req.query.category)) {
      throw new ApiError(400, "Invalid category id");
    }
    filter.category = req.query.category;
  }

  if (req.query.isAvailable !== undefined) {
    filter.isAvailable = req.query.isAvailable === "true";
  }

  if (req.query.inStock === "true") {
    filter.isAvailable = true;
    filter.$or = [
      { hasVariants: false, stock: { $gt: 0 } },
      { hasVariants: true, "variants.stock": { $gt: 0 } },
    ];
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  if (req.query.search && req.query.search.trim()) {
    filter.$text = { $search: req.query.search.trim() };
  }

  let sort = { createdAt: -1 };
  if (req.query.sort === "price_asc") sort = { price: 1 };
  if (req.query.sort === "price_desc") sort = { price: -1 };
  if (req.query.sort === "newest") sort = { createdAt: -1 };
  if (req.query.sort === "oldest") sort = { createdAt: 1 };

  const [rawProducts, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug emoji")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const products = rawProducts.map(serializeProduct);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: products.length,
        total,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Products fetched"
    )
  );
});

/* ========================================================================== */
/*                              GET /api/products/:id                          */
/* ========================================================================== */
export const getProductById = catchAsync(async (req, res) => {
  const raw = await Product.findById(req.params.id)
    .populate("category", "name slug emoji")
    .lean();

  if (!raw) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: serializeProduct(raw) },
        "Product fetched"
      )
    );
});

/* ========================================================================== */
/*                              GET /api/products/slug/:slug                   */
/* ========================================================================== */
export const getProductBySlug = catchAsync(async (req, res) => {
  const raw = await Product.findOne({ slug: req.params.slug })
    .populate("category", "name slug emoji")
    .lean();

  if (!raw) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: serializeProduct(raw) },
        "Product fetched"
      )
    );
});

/* ========================================================================== */
/*                              GET /api/products/featured                     */
/* ========================================================================== */
export const getFeaturedProducts = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 24);

  const raw = await Product.find({
    isAvailable: true,
    $or: [
      { hasVariants: false, stock: { $gt: 0 } },
      { hasVariants: true, "variants.stock": { $gt: 0 } },
    ],
  })
    .populate("category", "name slug emoji")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const products = raw.map(serializeProduct);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: products.length, products },
        "Featured products"
      )
    );
});

/* ========================================================================== */
/*                              POST /api/products                             */
/* ========================================================================== */
export const createProduct = catchAsync(async (req, res) => {
  const {
    title: rawTitle,
    slug: rawSlug,
    description: rawDesc,
    category,
    price,
    discount,
    stock,
    isAvailable,
    hasVariants,
    variants: rawVariants,
    tags: rawTags,
    seo: rawSeo,
  } = req.body;

  const title = parseMaybeJSON(rawTitle, "title");
  const description = parseMaybeJSON(rawDesc, "description");
  const variants = parseMaybeJSON(rawVariants, "variants") || [];
  const tags = parseMaybeJSON(rawTags, "tags") || [];
  const seo = parseMaybeJSON(rawSeo, "seo") || {};

  const baseSlug = rawSlug ? makeSlug(rawSlug) : makeSlug(title);
  const finalSlug = await ensureUniqueSlug(baseSlug);

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw new ApiError(400, "Category not found");

  const files = Array.isArray(req.files) ? req.files : [];
  if (files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }
  if (files.length > 8) {
    throw new ApiError(400, "A product can have at most 8 images");
  }

  const uploadedUrls = await Promise.all(
    files.map((f) => uploadBufferToCloudinary(f))
  );

  const hvBool = hasVariants === true || hasVariants === "true";

  const product = await Product.create({
    title,
    slug: finalSlug,
    description: description || {},
    category: categoryDoc._id,
    images: uploadedUrls,
    price: Number(price),
    discount: discount !== undefined ? Number(discount) : 0,
    stock: stock !== undefined ? Number(stock) : 0,
    isAvailable:
      isAvailable !== undefined
        ? isAvailable === true || isAvailable === "true"
        : true,
    hasVariants: hvBool,
    variants: hvBool ? variants : [],
    tags,
    seo,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { product: serializeProduct(product) },
        "Product created"
      )
    );
});

/* ========================================================================== */
/*                              PUT /api/products/:id                          */
/* ========================================================================== */
export const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const {
    title: rawTitle,
    slug: rawSlug,
    description: rawDesc,
    category,
    price,
    discount,
    stock,
    isAvailable,
    hasVariants,
    variants: rawVariants,
    tags: rawTags,
    seo: rawSeo,
    removeImages: rawRemoveImages,
  } = req.body;

  const title = parseMaybeJSON(rawTitle, "title");
  const description = parseMaybeJSON(rawDesc, "description");
  const variants = parseMaybeJSON(rawVariants, "variants");
  const tags = parseMaybeJSON(rawTags, "tags");
  const seo = parseMaybeJSON(rawSeo, "seo");
  const removeImages = parseMaybeJSON(rawRemoveImages, "removeImages") || [];

  if (rawSlug !== undefined) {
    const candidate = makeSlug(rawSlug);
    product.slug = await ensureUniqueSlug(candidate, product._id);
  } else if (title?.en && title.en !== product.title?.en) {
    const candidate = makeSlug(title.en);
    product.slug = await ensureUniqueSlug(candidate, product._id);
  }

  if (title) {
    product.title = { ...product.title.toObject(), ...title };
  }
  if (description) {
    product.description = { ...product.description.toObject(), ...description };
  }
  if (category !== undefined) {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) throw new ApiError(400, "Category not found");
    product.category = categoryDoc._id;
  }
  if (price !== undefined) product.price = Number(price);
  if (discount !== undefined) product.discount = Number(discount);
  if (stock !== undefined) product.stock = Number(stock);
  if (isAvailable !== undefined) {
    product.isAvailable = isAvailable === true || isAvailable === "true";
  }
  if (hasVariants !== undefined) {
    product.hasVariants = hasVariants === true || hasVariants === "true";
  }
  if (variants !== null && variants !== undefined) {
    product.variants = variants;
  }
  if (tags !== null && tags !== undefined) product.tags = tags;
  if (seo) {
    product.seo = {
      ...product.seo.toObject(),
      ...seo,
      metaTitle: {
        ...(product.seo.metaTitle?.toObject?.() ?? {}),
        ...(seo.metaTitle || {}),
      },
      metaDescription: {
        ...(product.seo.metaDescription?.toObject?.() ?? {}),
        ...(seo.metaDescription || {}),
      },
    };
  }

  if (removeImages.length > 0) {
    const toRemove = new Set(removeImages);
    const kept = [];
    for (const url of product.images) {
      if (toRemove.has(url)) {
        await deleteCloudinaryByUrl(url);
      } else {
        kept.push(url);
      }
    }
    product.images = kept;
  }

  const newFiles = Array.isArray(req.files) ? req.files : [];
  if (newFiles.length > 0) {
    const totalAfter = product.images.length + newFiles.length;
    if (totalAfter > 8) {
      throw new ApiError(
        400,
        `Cannot exceed 8 images total. Current: ${product.images.length}, trying to add: ${newFiles.length}`
      );
    }
    const uploadedUrls = await Promise.all(
      newFiles.map((f) => uploadBufferToCloudinary(f))
    );
    product.images = [...product.images, ...uploadedUrls];
  }

  await product.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: serializeProduct(product) },
        "Product updated"
      )
    );
});

/* ========================================================================== */
/*                              DELETE /api/products/:id                       */
/* ========================================================================== */
export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  await Promise.all(product.images.map((url) => deleteCloudinaryByUrl(url)));

  await product.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedSlug: product.slug }, "Product deleted")
    );
});

/* ========================================================================== */
/*                              PATCH /api/products/:id/toggle                 */
/* ========================================================================== */
export const toggleAvailability = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  product.isAvailable = !product.isAvailable;
  await product.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: serializeProduct(product) },
        `Product is now ${product.isAvailable ? "available" : "unavailable"}`
      )
    );
});

/* ========================================================================== */
/*                              PATCH /api/products/:id/discount               */
/* ========================================================================== */
export const setProductDiscount = catchAsync(async (req, res) => {
  const { discount } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  product.discount = Number(discount);
  await product.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: serializeProduct(product) },
        `Discount set to ${product.discount}%`
      )
    );
});

/* ========================================================================== */
/*                              DELETE /api/products/:id/image                 */
/* ========================================================================== */
export const deleteProductImage = catchAsync(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) throw new ApiError(400, "imageUrl is required");

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (!product.images.includes(imageUrl)) {
    throw new ApiError(404, "Image not found on this product");
  }

  if (product.images.length <= 1) {
    throw new ApiError(
      400,
      "Cannot remove the last image. Delete the product or upload a new image first."
    );
  }

  await deleteCloudinaryByUrl(imageUrl);
  product.images = product.images.filter((u) => u !== imageUrl);
  await product.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: serializeProduct(product) },
        "Image removed"
      )
    );
});

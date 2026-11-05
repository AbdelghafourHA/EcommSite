// controllers/category.controller.js
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { makeSlug } from "../utils/slugify.js";

/* -------------------------------------------------------------------------- */
/*                          Cloudinary helpers                                */
/* -------------------------------------------------------------------------- */
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
  folder = "ecommerce/categories"
) => {
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    transformation: [{ width: 800, height: 800, crop: "limit" }],
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

/* -------------------------------------------------------------------------- */
/*                              GET /api/categories                           */
/* -------------------------------------------------------------------------- */
export const getCategories = catchAsync(async (req, res) => {
  const { activeOnly } = req.query;

  const filter = {};
  if (activeOnly === "true") filter.isActive = true;

  const categories = await Category.find(filter)
    .sort({ order: 1, "name.en": 1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: categories.length, categories },
        "Categories fetched"
      )
    );
});

/* -------------------------------------------------------------------------- */
/*                              GET /api/categories/:id                       */
/* -------------------------------------------------------------------------- */
export const getCategoryById = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) throw new ApiError(404, "Category not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { category }, "Category fetched"));
});

/* -------------------------------------------------------------------------- */
/*                        GET /api/categories/slug/:slug                      */
/* -------------------------------------------------------------------------- */
export const getCategoryBySlug = catchAsync(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) throw new ApiError(404, "Category not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { category }, "Category fetched"));
});

/* -------------------------------------------------------------------------- */
/*                              POST /api/categories                          */
/* -------------------------------------------------------------------------- */
export const createCategory = catchAsync(async (req, res) => {
  const { name, slug, description, emoji, order, isActive, seo } = req.body;

  const finalSlug = slug || makeSlug(name);

  let finalOrder = order;
  if (finalOrder === undefined) {
    const last = await Category.findOne()
      .sort({ order: -1 })
      .select("order")
      .lean();
    finalOrder = last ? last.order + 1 : 0;
  }

  const slugExists = await Category.exists({ slug: finalSlug });
  if (slugExists) {
    throw new ApiError(409, `Slug "${finalSlug}" is already in use`);
  }

  // ── Upload image if provided ──
  let imageUrl = "";
  if (req.file) {
    imageUrl = await uploadBufferToCloudinary(req.file);
  }

  const category = await Category.create({
    name,
    slug: finalSlug,
    description: description || {},
    emoji: emoji || "🍽️",
    image: imageUrl,
    order: finalOrder,
    isActive: isActive !== undefined ? isActive : true,
    seo: seo || {},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { category }, "Category created"));
});

/* -------------------------------------------------------------------------- */
/*                              PUT /api/categories/:id                       */
/* -------------------------------------------------------------------------- */
export const updateCategory = catchAsync(async (req, res) => {
  const { name, slug, description, emoji, order, isActive, seo } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  // ── Handle image: upload new, delete old ──
  if (req.file) {
    const uploadedUrl = await uploadBufferToCloudinary(req.file);
    if (category.image) {
      await deleteCloudinaryByUrl(category.image);
    }
    category.image = uploadedUrl;
  } else if (req.body.removeImage === "true" && category.image) {
    await deleteCloudinaryByUrl(category.image);
    category.image = "";
  }

  // ── Slug handling ──
  let newSlug = category.slug;
  if (slug !== undefined && slug !== category.slug) {
    const exists = await Category.exists({ slug, _id: { $ne: category._id } });
    if (exists) throw new ApiError(409, `Slug "${slug}" is already in use`);
    newSlug = slug;
  } else if (slug === undefined && name?.en && name.en !== category.name?.en) {
    const generated = makeSlug(name.en);
    const exists = await Category.exists({
      slug: generated,
      _id: { $ne: category._id },
    });
    if (!exists) newSlug = generated;
  }
  category.slug = newSlug;

  // ── Other fields ──
  if (name) {
    category.name = {
      ...(category.name?.toObject?.() ?? category.name),
      ...name,
    };
  }
  if (description) {
    category.description = {
      ...(category.description?.toObject?.() ?? category.description ?? {}),
      ...description,
    };
  }
  if (emoji !== undefined) category.emoji = emoji;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;
  if (seo) {
    category.seo = {
      metaTitle: {
        ...(category.seo?.metaTitle?.toObject?.() ??
          category.seo?.metaTitle ??
          {}),
        ...(seo.metaTitle || {}),
      },
      metaDescription: {
        ...(category.seo?.metaDescription?.toObject?.() ??
          category.seo?.metaDescription ??
          {}),
        ...(seo.metaDescription || {}),
      },
    };
  }

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { category }, "Category updated"));
});

/* -------------------------------------------------------------------------- */
/*                              DELETE /api/categories/:id                    */
/* -------------------------------------------------------------------------- */
export const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const productCount = await Product.countDocuments({
    category: category._id,
  });

  if (productCount > 0) {
    throw new ApiError(
      409,
      `Cannot delete: ${productCount} product(s) still use this category. Reassign them first.`,
      { productCount }
    );
  }

  // Delete image from Cloudinary
  if (category.image) {
    await deleteCloudinaryByUrl(category.image);
  }

  await category.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedSlug: category.slug }, "Category deleted")
    );
});

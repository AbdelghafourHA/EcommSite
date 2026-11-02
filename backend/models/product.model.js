// models/product.model.js
import mongoose from "mongoose";
import { makeSlug } from "../utils/slugify.js";

/* -------------------------------------------------------------------------- */
/*                              Localized field                               */
/* -------------------------------------------------------------------------- */
const localizedString = (required = true, max = 500) =>
  new mongoose.Schema(
    {
      ar: {
        type: String,
        required,
        trim: true,
        maxlength: [max, `Arabic text cannot exceed ${max} characters`],
      },
      fr: {
        type: String,
        required,
        trim: true,
        maxlength: [max, `French text cannot exceed ${max} characters`],
      },
      en: {
        type: String,
        required,
        trim: true,
        maxlength: [max, `English text cannot exceed ${max} characters`],
      },
    },
    { _id: false }
  );

/* -------------------------------------------------------------------------- */
/*                              Variant sub-schema                            */
/* -------------------------------------------------------------------------- */
const variantSchema = new mongoose.Schema(
  {
    name: {
      type: localizedString(true, 50),
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  { _id: true }
);

/* -------------------------------------------------------------------------- */
/*                              Product schema                                */
/* -------------------------------------------------------------------------- */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: localizedString(true, 120),
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and hyphens only",
      ],
    },
    description: {
      type: localizedString(false, 3000),
      default: {},
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 8,
        message: "A product can have at most 8 images",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "A product can have at most 20 tags",
      },
    },
    seo: {
      metaTitle: { type: localizedString(false, 70), default: {} },
      metaDescription: { type: localizedString(false, 160), default: {} },
      ogImage: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -------------------------------------------------------------------------- */
/*                              Virtuals                                      */
/* -------------------------------------------------------------------------- */
// Final price after discount — always up to date, never stale
productSchema.virtual("discountedPrice").get(function () {
  if (!this.discount || this.discount <= 0) return this.price;
  return Math.round(this.price * (1 - this.discount / 100) * 100) / 100;
});

// "Is this product actually purchasable right now?"
// - Must be marked available by admin
// - AND (if hasVariants) at least one variant has stock > 0
// - AND (if !hasVariants) stock > 0
//
// NOTE: this is DIFFERENT from `isAvailable`. A product with
// `isAvailable: true` and `stock: 0` still appears in the storefront
// (with an "out of stock" badge) — that's correct behaviour for SEO.
// `inStock` only controls whether the add-to-cart / WhatsApp buttons work.
productSchema.virtual("inStock").get(function () {
  if (!this.isAvailable) return false;
  if (this.hasVariants) {
    return this.variants.some((v) => v.stock > 0);
  }
  return this.stock > 0;
});

/* -------------------------------------------------------------------------- */
/*                              Auto-generate slug                            */
/* -------------------------------------------------------------------------- */
productSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = makeSlug(this.title);
  }
});

/* -------------------------------------------------------------------------- */
/*                              Indexes                                       */
/* -------------------------------------------------------------------------- */
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 1 });
productSchema.index({
  "title.ar": "text",
  "title.fr": "text",
  "title.en": "text",
  "description.ar": "text",
  "description.fr": "text",
  "description.en": "text",
});

const Product = mongoose.model("Product", productSchema);
export default Product;

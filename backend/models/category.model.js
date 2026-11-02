// models/category.model.js
import mongoose from "mongoose";
import { makeSlug } from "../utils/slugify.js";

/* -------------------------------------------------------------------------- */
/*                              Localized field                               */
/* -------------------------------------------------------------------------- */
// Reusable sub-schema for { ar, fr, en } strings
const localizedString = (required = true, max = 200) =>
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

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: localizedString(true, 50),
      required: true,
    },
    slug: {
      type: String,
      unique: true, // ← unique index created here (do NOT redeclare below)
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and hyphens only",
      ],
    },
    description: {
      type: localizedString(false, 500),
      default: {},
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    emoji: {
      type: String,
      default: "🍽️",
      trim: true,
      maxlength: [8, "Emoji must be a single character"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: { type: localizedString(false, 70), default: {} },
      metaDescription: { type: localizedString(false, 160), default: {} },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -------------------------------------------------------------------------- */
/*                              Auto-generate slug                            */
/* -------------------------------------------------------------------------- */
// Runs on validate if slug is missing — uses English (or fr/ar fallback)
categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = makeSlug(this.name);
  }
});

/* -------------------------------------------------------------------------- */
/*                              Indexes                                       */
/* -------------------------------------------------------------------------- */
// NOTE: `slug` already has a unique index via `unique: true` on the field.
// Do NOT redeclare it here — that would create a duplicate index.
categorySchema.index({ isActive: 1, order: 1 });
categorySchema.index({
  "name.ar": "text",
  "name.fr": "text",
  "name.en": "text",
});

const Category = mongoose.model("Category", categorySchema);
export default Category;

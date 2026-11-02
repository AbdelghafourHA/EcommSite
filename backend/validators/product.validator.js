// validators/product.validator.js
import { body, param } from "express-validator";

/* -------------------------------------------------------------------------- */
/*                          Localized string helpers                          */
/* -------------------------------------------------------------------------- */
const requiredLocalized = (field, max) => [
  body(`${field}.ar`)
    .trim()
    .notEmpty()
    .withMessage(`${field}.ar is required`)
    .isLength({ max })
    .withMessage(`${field}.ar cannot exceed ${max} characters`),
  body(`${field}.fr`)
    .trim()
    .notEmpty()
    .withMessage(`${field}.fr is required`)
    .isLength({ max })
    .withMessage(`${field}.fr cannot exceed ${max} characters`),
  body(`${field}.en`)
    .trim()
    .notEmpty()
    .withMessage(`${field}.en is required`)
    .isLength({ max })
    .withMessage(`${field}.en cannot exceed ${max} characters`),
];

const optionalLocalized = (field, max) => [
  body(`${field}.ar`)
    .optional()
    .trim()
    .isLength({ max })
    .withMessage(`${field}.ar cannot exceed ${max} characters`),
  body(`${field}.fr`)
    .optional()
    .trim()
    .isLength({ max })
    .withMessage(`${field}.fr cannot exceed ${max} characters`),
  body(`${field}.en`)
    .optional()
    .trim()
    .isLength({ max })
    .withMessage(`${field}.en cannot exceed ${max} characters`),
];

/* -------------------------------------------------------------------------- */
/*                          hasVariants condition helpers                     */
/* -------------------------------------------------------------------------- */
// FormData sends "true" (string); JSON sends true (boolean). Handle both.
const hasVariantsCondition = (value, { req }) => {
  const hv = req.body?.hasVariants;
  return hv === "true" || hv === true;
};

const noVariantsCondition = (value, { req }) => {
  const hv = req.body?.hasVariants;
  // "no variants" means the field is absent OR explicitly false
  if (hv === undefined) return true;
  return hv !== "true" && hv !== true;
};

/* -------------------------------------------------------------------------- */
/*                          Variant validation                                */
/* -------------------------------------------------------------------------- */
const variantRules = [
  body("variants.*.name.ar")
    .if(hasVariantsCondition)
    .trim()
    .notEmpty()
    .withMessage("Each variant requires name.ar")
    .isLength({ max: 50 }),
  body("variants.*.name.fr")
    .if(hasVariantsCondition)
    .trim()
    .notEmpty()
    .withMessage("Each variant requires name.fr")
    .isLength({ max: 50 }),
  body("variants.*.name.en")
    .if(hasVariantsCondition)
    .trim()
    .notEmpty()
    .withMessage("Each variant requires name.en")
    .isLength({ max: 50 }),
  body("variants.*.price")
    .if(hasVariantsCondition)
    .isFloat({ min: 0 })
    .withMessage("Each variant requires a non-negative price")
    .toFloat(),
  body("variants.*.stock")
    .if(hasVariantsCondition)
    .isInt({ min: 0 })
    .withMessage("Each variant requires a non-negative stock")
    .toInt(),
];

/* -------------------------------------------------------------------------- */
/*                          Conditional: hasVariants                          */
/* -------------------------------------------------------------------------- */
// If hasVariants = true → variants must be non-empty array
const variantsRequiredWhenHasVariants = body("variants")
  .if(hasVariantsCondition)
  .isArray({ min: 1 })
  .withMessage("At least one variant is required when hasVariants is true");

// If hasVariants is absent/false → variants should be empty (or omitted)
const variantsEmptyWhenNoVariants = body("variants")
  .if(noVariantsCondition)
  .optional()
  .isArray({ max: 0 })
  .withMessage("variants must be empty when hasVariants is false");

/* -------------------------------------------------------------------------- */
/*                          Common field rules                                */
/* -------------------------------------------------------------------------- */
const commonProductFields = [
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number")
    .toFloat(),
  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100")
    .toFloat(),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer")
    .toInt(),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean")
    .toBoolean(),
  body("hasVariants")
    .optional()
    .isBoolean()
    .withMessage("hasVariants must be a boolean")
    .toBoolean(),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid id"),
  body("slug")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must be lowercase letters, numbers, and hyphens only (e.g. 'pizza-margherita')"
    )
    .isLength({ max: 120 }),
  body("images")
    .optional()
    .isArray({ max: 8 })
    .withMessage("A product can have at most 8 images"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string URL"),
  body("tags")
    .optional()
    .isArray({ max: 20 })
    .withMessage("A product can have at most 20 tags"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be 1–30 characters"),
];

/* -------------------------------------------------------------------------- */
/*                              Create                                        */
/* -------------------------------------------------------------------------- */
export const createProductValidator = [
  ...requiredLocalized("title", 120),
  ...optionalLocalized("description", 3000),
  ...commonProductFields,
  variantsRequiredWhenHasVariants,
  variantsEmptyWhenNoVariants,
  ...variantRules,
  ...optionalLocalized("seo.metaTitle", 70),
  ...optionalLocalized("seo.metaDescription", 160),
  body("seo.ogImage")
    .optional()
    .trim()
    .isURL()
    .withMessage("ogImage must be a valid URL"),
];

/* -------------------------------------------------------------------------- */
/*                              Update (partial)                              */
/* -------------------------------------------------------------------------- */
export const updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id"),

  // title — any language may be updated individually
  body("title.ar").optional().trim().isLength({ max: 120 }),
  body("title.fr").optional().trim().isLength({ max: 120 }),
  body("title.en").optional().trim().isLength({ max: 120 }),

  // description — optional, per language
  ...optionalLocalized("description", 3000),

  // price, discount, stock, isAvailable, hasVariants — all optional on update
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number")
    .toFloat(),
  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100")
    .toFloat(),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer")
    .toInt(),
  body("isAvailable").optional().isBoolean().toBoolean(),
  body("hasVariants").optional().isBoolean().toBoolean(),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid id"),
  body("slug")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Slug must be lowercase letters, numbers, and hyphens only")
    .isLength({ max: 120 }),
  body("images")
    .optional()
    .isArray({ max: 8 })
    .withMessage("A product can have at most 8 images"),
  body("images.*").optional().isString(),
  body("tags")
    .optional()
    .isArray({ max: 20 })
    .withMessage("A product can have at most 20 tags"),
  body("tags.*").optional().trim().isLength({ min: 1, max: 30 }),

  // Variants on update — only validated if hasVariants is explicitly set
  variantsRequiredWhenHasVariants,
  variantsEmptyWhenNoVariants,
  ...variantRules,

  // SEO — optional on update
  ...optionalLocalized("seo.metaTitle", 70),
  ...optionalLocalized("seo.metaDescription", 160),
  body("seo.ogImage").optional().trim().isURL(),
];

/* -------------------------------------------------------------------------- */
/*                              Params                                        */
/* -------------------------------------------------------------------------- */
export const productIdValidator = [
  param("id").isMongoId().withMessage("Invalid product id"),
];

export const productSlugValidator = [
  param("slug")
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Invalid slug format"),
];

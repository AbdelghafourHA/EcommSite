// validators/category.validator.js
import { body, param } from "express-validator";

/* -------------------------------------------------------------------------- */
/*                          Localized string helpers                          */
/* -------------------------------------------------------------------------- */
// Require all 3 languages on create
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

// Optional on update / for seo fields
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
/*                              Create                                        */
/* -------------------------------------------------------------------------- */
export const createCategoryValidator = [
  ...requiredLocalized("name", 50),
  body("slug")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must be lowercase letters, numbers, and hyphens only (e.g. 'soft-drinks')"
    )
    .isLength({ max: 50 })
    .withMessage("Slug cannot exceed 50 characters"),
  ...optionalLocalized("description", 500),
  body("emoji")
    .optional()
    .trim()
    .isLength({ max: 8 })
    .withMessage("Emoji must be a single character"),
  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer")
    .toInt(),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean")
    .toBoolean(),
  ...optionalLocalized("seo.metaTitle", 70),
  ...optionalLocalized("seo.metaDescription", 160),
];

/* -------------------------------------------------------------------------- */
/*                              Update (partial)                              */
/* -------------------------------------------------------------------------- */
export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category id"),

  body("name.ar").optional().trim().isLength({ max: 50 }),
  body("name.fr").optional().trim().isLength({ max: 50 }),
  body("name.en").optional().trim().isLength({ max: 50 }),
  body("slug")
    .optional()
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Slug must be lowercase letters, numbers, and hyphens only")
    .isLength({ max: 50 }),
  ...optionalLocalized("description", 500),
  body("emoji").optional().trim().isLength({ max: 8 }),
  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
  body("order").optional().isInt({ min: 0 }).toInt(),
  body("isActive").optional().isBoolean().toBoolean(),
  ...optionalLocalized("seo.metaTitle", 70),
  ...optionalLocalized("seo.metaDescription", 160),
];

/* -------------------------------------------------------------------------- */
/*                              Delete / get by id                            */
/* -------------------------------------------------------------------------- */
export const categoryIdValidator = [
  param("id").isMongoId().withMessage("Invalid category id"),
];

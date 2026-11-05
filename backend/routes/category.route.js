// routes/category.route.js
import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} from "../validators/category.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import upload from "../lib/multer.js";

const router = Router();

/* --------------------------- Public --------------------------- */
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", categoryIdValidator, validate, getCategoryById);

/* --------------------------- Admin only ---------------------- */
router.post(
  "/",
  protect,
  upload.single("image"),
  createCategoryValidator,
  validate,
  createCategory
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateCategoryValidator,
  validate,
  updateCategory
);

router.delete("/:id", protect, categoryIdValidator, validate, deleteCategory);

export default router;

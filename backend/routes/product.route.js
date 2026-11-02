// routes/product.route.js
import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  setProductDiscount,
  deleteProductImage,
} from "../controllers/product.controller.js";
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} from "../validators/product.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import upload from "../lib/multer.js";
import parseMultipartJSON from "../middlewares/parse-multipart-json.middleware.js";

const router = Router();

/* --------------------------- Public --------------------------- */
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", productIdValidator, validate, getProductById);

/* --------------------------- Admin only ---------------------- */
router.post(
  "/",
  protect,
  upload.array("images", 8),
  parseMultipartJSON,
  createProductValidator,
  validate,
  createProduct
);

router.put(
  "/:id",
  protect,
  upload.array("images", 8),
  parseMultipartJSON,
  updateProductValidator,
  validate,
  updateProduct
);

router.delete("/:id", protect, productIdValidator, validate, deleteProduct);

router.patch(
  "/:id/toggle",
  protect,
  productIdValidator,
  validate,
  toggleAvailability
);

router.patch(
  "/:id/discount",
  protect,
  productIdValidator,
  validate,
  setProductDiscount
);

router.delete(
  "/:id/image",
  protect,
  productIdValidator,
  validate,
  deleteProductImage
);

export default router;

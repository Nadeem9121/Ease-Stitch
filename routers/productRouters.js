const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authControllers");
const upload = require("../middlewares/uploads");

const router = express.Router();

// CRUD routes
// CRUD routes with authentication and optional authorization
router.post(
  "/create-product",
  authController.protect,
  authController.restrictedTo("admin"), // Only admins or sellers can create products
  upload,
  productController.createProduct
);
router.get(
  "/get-all-products",
  authController.protect,
  productController.getProducts
); // Accessible to any authenticated user
router.get(
  "/get-product/:id",
  authController.protect,
  productController.getProductById
); // Accessible to any authenticated user

router.post(
  "/:id/review",
  authController.protect,
  productController.createProductReview
);
router.get(
  "/top-ten-products",
  authController.protect,
  productController.getTopProducts
);
router.put(
  "/update-product/:id",
  authController.protect,
  authController.restrictedTo("admin"), // Only admins or sellers can update products
  productController.updateProduct
);
router.delete(
  "/delete-product/:id",
  authController.protect,
  authController.restrictedTo("admin"), // Only admins can delete products
  productController.deleteProduct
);

module.exports = router;

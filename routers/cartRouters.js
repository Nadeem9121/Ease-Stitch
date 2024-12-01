const express = require("express");
const router = express.Router();
const {
  addProductsToCart,
  applyCoupon,
  saveForLater,
  checkCartExpiry,
  removeProductFromCart, // Add the removeFromCart controller here
} = require("../controllers/cartControllers");
const { protect } = require("../controllers/authControllers");

// Protect routes so only authenticated users can access them
router.route("/add-product").post(protect, addProductsToCart);
router.route("/apply-coupon").post(protect, applyCoupon);
router.delete("/remove/:productId", protect, removeProductFromCart);

module.exports = router;

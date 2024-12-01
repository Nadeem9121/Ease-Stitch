const express = require("express");
const orderController = require("../controllers/orderControllers");
const authController = require("../controllers/authControllers");

const router = express.Router();

// @route   POST /api/orders
// @access  Private
router.post(
  "/addOrderItems",
  authController.protect,
  orderController.addOrderItems
);

// @route   GET /api/orders/myorders
// @access  Private
router.get("/myorders", authController.protect, orderController.getMyOrders);

// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", authController.protect, orderController.getOrderById);

// @route   PUT /api/orders/:id/pay
// @access  Private
router.put(
  "/:id/pay",
  authController.protect,
  orderController.updateOrderToPaid
);

// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put(
  "/:id/deliver",
  authController.protect,
  authController.restrictedTo("admin"),
  orderController.updateOrderToDelivered
);

// @route   GET /api/orders
// @access  Private/Admin
router.get(
  "/",
  authController.protect,
  authController.restrictedTo("admin"),
  orderController.getOrders
);

module.exports = router;

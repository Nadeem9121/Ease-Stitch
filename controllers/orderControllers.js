const asyncHandler = require("../middlewares/asyncHandler");
const Order = require("../models/orderModel");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = asyncHandler(async (req, res) => {
  const { products, shippingDetails, paymentDetails, isGift, giftMessage } =
    req.body;

  if (!products || products.length === 0) {
    res.status(400);
    throw new Error("No products in the order");
  }

  const totalAmount = products.reduce((acc, item) => acc + item.totalPrice, 0);

  const order = new Order({
    user: req.user._id,
    products,
    shippingDetails,
    paymentDetails: {
      ...paymentDetails,
      paymentAmount: totalAmount,
    },
    totalAmount,
    isGift,
    giftMessage,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("products.productId", "name price");

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order payment details
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.paymentDetails.paymentStatus = "completed";
    order.paymentDetails.transactionId = req.body.transactionId || null;
    order.paymentDetails.paymentAmount =
      req.body.paymentAmount || order.totalAmount;

    order.orderStatus = "processing";
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = "delivered";
    order.deliveryDate = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .populate("products.productId", "name price");
  res.json(orders);
});

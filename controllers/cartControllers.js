const Cart = require("../models/cartModel");
const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Add product to cart or update cart
exports.addProductsToCart = asyncHandler(async (req, res) => {
  const productsToAdd = req.body.products; // Expected to be an array of products

  if (!Array.isArray(productsToAdd) || productsToAdd.length === 0) {
    res.status(400);
    throw new Error("No products provided");
  }

  // Find the user's cart or create a new one
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, products: [], totalAmount: 0 });
  }

  // Loop through each product to add or update in the cart
  for (const item of productsToAdd) {
    const { productId, quantity } = item;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Handle cases where price is an object (e.g., { base: 20000, customization: 2000 })
    let price = product.price;
    if (typeof price === "object" && price !== null) {
      // If price is an object with base and customization, sum them up
      price = (price.base || 0) + (price.customization || 0);
    }

    // Find if the product already exists in the cart
    const existingProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex >= 0) {
      // Update the product quantity and totalPrice if the product exists
      cart.products[existingProductIndex].quantity += quantity;
      cart.products[existingProductIndex].totalPrice =
        cart.products[existingProductIndex].quantity * price;
    } else {
      // Add the new product to the cart
      cart.products.push({
        productId,
        quantity,
        price,
        totalPrice: price * quantity,
      });
    }
  }

  // Recalculate total amount
  cart.totalAmount = cart.calculateTotal(); // Use the calculateTotal method to update totalAmount

  // Save the cart
  await cart.save();

  res.status(201).json(cart);
});

// Apply discount coupon
exports.applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const discount = couponCode === "DISCOUNT10" ? 10 : 0; // Example of a simple coupon check

  cart.discountCode = couponCode;
  cart.discountAmount = (cart.totalAmount * discount) / 100;
  cart.totalAmount -= cart.discountAmount;

  const updatedCart = await cart.save();
  res.json(updatedCart);
});

// @desc    Remove product from cart
// @route   DELETE /api/cart/remove
// @access  Private
exports.removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params; // Get productId from URL
  // console.log("Received productId:", productId); // Log the productId for debugging

  // Validate if productId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid Product ID format");
  }

  // Find the user's cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Find the product in the cart
  const productIndex = cart.products.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (productIndex === -1) {
    res.status(404);
    throw new Error("Product not found in the cart");
  }

  // Remove the product from the cart
  cart.products.splice(productIndex, 1);

  // Recalculate the total amount
  cart.totalAmount = cart.calculateTotal(); // Recalculate total using the method in the model

  // Save the updated cart
  await cart.save();

  res.status(200).json({
    message: "Product removed from cart",
    cart,
  });
});

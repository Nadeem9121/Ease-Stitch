const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        customizationDetails: {
          type: Object, // Any additional details regarding customizations
        },
      },
    ],
    savedForLater: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    expiresAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Middleware to update 'updatedAt' on any changes
CartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate the total price of an order, including saved items and discounts
// Cart model - calculateTotal method
CartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.products.reduce(
    (acc, product) => acc + product.totalPrice,
    0
  );
  return this.totalAmount; // Return a number, not a promise
};

module.exports = mongoose.model("Cart", CartSchema);

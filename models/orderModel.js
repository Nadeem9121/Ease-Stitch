const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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
          type: Number, // total price for this specific product (quantity * price)
          required: true,
        },
        customizationDetails: {
          type: Object, // Any additional details regarding customizations
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingDetails: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentDetails: {
      paymentMethod: {
        type: String,
        enum: ["credit-card", "paypal", "cash-on-delivery", "bank-transfer"],
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      transactionId: {
        type: String, // Optional: can be used for reference to payment service
      },
      paymentAmount: {
        type: Number,
        required: true,
      },
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "canceled",
        "returned",
      ],
      default: "pending",
    },
    deliveryDate: {
      type: Date, // Estimated or actual delivery date
    },
    trackingNumber: {
      type: String, // Courier tracking number for shipped orders
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isGift: {
      type: Boolean,
      default: false,
    },
    giftMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to update 'updatedAt' on any changes
OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate the total price of an order
OrderSchema.methods.calculateTotal = function () {
  this.totalAmount = this.products.reduce(
    (acc, product) => acc + product.totalPrice,
    0
  );
  return this.totalAmount;
};

// Static method to check if the order is eligible for delivery
OrderSchema.methods.isEligibleForDelivery = function () {
  return this.orderStatus === "shipped" || this.orderStatus === "processing";
};

module.exports = mongoose.model("Order", OrderSchema);

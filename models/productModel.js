const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Shalwar Kameez",
        "Kurta",
        "Sherwani",
        "Lehenga",
        "Gown",
        "Maxi",
        "Suit",
        "Shirt",
        "Pant",
        "Jacket",
        "Other",
        "Fabric",
        "Buttons",
        "Zippers",
        "Thread",
        "Lining",
        "Embroidery Material",
        "Lace",
        "Beads",
        "Sequins",
      ],
    },

    price: {
      base: { type: Number, required: [true, "Base price is required"] },
      customization: { type: Number, default: 0 }, // Additional cost for customizations
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "Product image" },
      },
    ],
    measurements: {
      type: Map,
      of: Number, // Example: {'chest': 40, 'waist': 32}
      required: [true, "Measurements are required"],
    },
    customizations: {
      fabric: { type: String, trim: true },
      color: { type: String, trim: true },
      pattern: { type: String, trim: true }, // E.g., "Striped", "Plain", etc.
      extras: [
        {
          type: { type: String, enum: ["Embroidery", "Pockets", "Buttons"] },
          description: String,
        },
      ],
    },
    availability: {
      inStock: { type: Boolean, default: true },
      leadTime: { type: Number, default: 7 }, // Days to complete the product
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5, // Assuming 1-5 rating
        },
        comment: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    salesCount: {
      type: Number,
      default: 0, // Track number of sales
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);

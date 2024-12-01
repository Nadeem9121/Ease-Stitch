const Product = require("../models/productModel"); // Assuming the schema file is named Product.js
const asyncHandler = require("../middlewares/asyncHandler");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // If images are uploaded, set their URLs
    const imageUrls = [];
    if (req.files) {
      req.files.forEach((file) => {
        imageUrls.push(`/uploads/${file.filename}`); // Store the relative path to each image
      });
    }

    // Convert measurements into a Map of Numbers
    const measurements = {};
    Object.keys(req.body).forEach((key) => {
      if (key.startsWith("measurements[")) {
        const measurementKey = key.slice("measurements[".length, -1); // Extract the key name
        measurements[measurementKey] = parseFloat(req.body[key]); // Convert the value to a Number
      }
    });

    const product = new Product({
      ...req.body,
      measurements: measurements, // Pass the correctly parsed measurements map
      createdBy: req.user.id, // Assuming `req.user` holds the authenticated user
      images: imageUrls.map((url) => ({
        url,
        alt: req.body.imageAlt || "Product image",
      })),
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all products with advanced filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["sort", "page", "limit"];
    excludeFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|lte|gt|lt|in)\b/g,
      (match) => `$${match}`
    );

    const filters = JSON.parse(queryStr);

    // Handle nested fields explicitly
    if (req.query["price[gte]"]) {
      filters["price.base"] = { $gte: parseFloat(req.query["price[gte]"]) };
      delete req.query["price[gte]"];
    }

    let query = Product.find(filters);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort
        .split(",")
        .map((field) => (field === "price" ? "price.base" : field))
        .join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Use deleteOne instead of remove
    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateSalesCount = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Increment sales count by 1 (or by the quantity purchased)
    product.salesCount += 1;

    // Save updated product
    await product.save();
  } catch (err) {
    console.error("Error updating sales count:", err.message);
  }
};

exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Ensure reviews array is initialized
  if (!product.reviews) {
    product.reviews = [];
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res
      .status(400)
      .json({ success: false, message: "Product already reviewed" });
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;

  product.reviews.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});

exports.getTopProducts = asyncHandler(async (req, res) => {
  // Find the top 3 products based on average rating (descending order)
  const products = await Product.find({})
    .sort({ "ratings.average": -1 })
    .limit(3);

  // Return the top products
  res.json(products);
});

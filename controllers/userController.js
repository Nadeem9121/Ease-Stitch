const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// Update User Profile
exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const { name, email, role } = req.body;

  // Check if user is trying to change their role to admin
  if (role && role === "admin" && req.user.role !== "admin") {
    return next(
      new AppError(
        "You do not have permission to change your role to admin",
        403
      )
    );
  }

  // Ensure users cannot change their role to admin
  const updates = { name, email };
  if (role && (role === "user" || role === "tailor")) {
    updates.role = role;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

// Upload Profile Picture
exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePicture: req.file.path },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

// Delete a User's Profile Picture
exports.deleteProfilePicture = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user || !user.profilePicture) {
    return next(new AppError("Profile picture not found", 404));
  }

  // Delete the file from the server
  fs.unlinkSync(path.resolve(user.profilePicture));

  // Update user document to remove profile picture path
  user.profilePicture = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Profile picture deleted successfully",
  });
});

exports.manageUserProfile = async (req, res) => {
  try {
    const { name, gender, phone } = req.body;
    const userId = req.user.id; // Ensure `req.user` is populated by authentication middleware

    // Validate inputs from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Only allow updates for the specified fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (gender !== undefined) updates.gender = gender;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { address } = req.body;
    const userId = req.user.id; // Assuming authenticated user ID is in req.user

    // Ensure the address object is provided and has at least one field to update
    if (
      !address ||
      (typeof address === "object" &&
        !Object.keys(address).some((field) =>
          ["province", "city", "address"].includes(field)
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    // Update the user's address
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { address } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: updatedUser.address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { password } = req.body;
    const userId = req.user.id; // Assuming authenticated user's ID is available in req.user

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

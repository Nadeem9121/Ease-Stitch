const express = require("express");
const userVerificationController = require("../controllers/userVerificationController");
const { protect } = require("../controllers/authControllers"); // Middleware to protect routes

const router = express.Router();

// Route to request OTP for user verification
router.post(
  "/request-verification",
  protect,
  userVerificationController.requestUserVerification
);

// Route to verify OTP
router.post("/verify", protect, userVerificationController.verifyUser);

// Route to resend OTP
router.post(
  "/resend-verification",
  protect,
  userVerificationController.resendVerificationEmail
);

module.exports = router;

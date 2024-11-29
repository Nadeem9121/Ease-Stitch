const express = require("express");
const {
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetPassword,
} = require("../controllers/forgotPassword");

const router = express.Router();

// Route to request OTP for password reset
router.post("/request-reset", requestPasswordReset);

// Route to verify OTP for password reset
router.post("/verify-otp", verifyPasswordResetOTP);

// Route to reset the password
router.post("/reset", resetPassword);

module.exports = router;

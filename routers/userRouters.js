const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authControllers");
const upload = require("../Utils/multer");
const {
  validateUserProfileUpdate,
  validateAddress,
  validatePasswordChange,
} = require("../middlewares/validator");

const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get(
  "/get-all-users",
  authController.protect,
  authController.restrictedTo("admin"),
  userController.getAllUsers
);

// Protected routes
router.use(authController.protect); // Middleware to protect routes below

router.get("/me", (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

router.put(
  "/manage-profile",
  authController.protect, // Check if the user is logged in
  validateUserProfileUpdate, // Validate the input
  userController.manageUserProfile // Update the user profile
);

router.put(
  "/manage-address",
  authController.protect,
  validateAddress,
  userController.updateAddress
);
router.put(
  "/change-password",
  authController.protect, // Middleware to authenticate the user
  validatePasswordChange, // Middleware to validate password fields
  userController.changePassword // Controller to change the password
);
router.get("/logout", authController.logout);

router.patch("/updateProfile/:userId", userController.updateUserProfile);
router.post(
  "/uploadProfilePicture/:userId",
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);
router.delete(
  "/deleteProfilePicture/:userId",
  userController.deleteProfilePicture
);

// // Admin-only route
// router.use(authController.restrictedTo("admin"));

// router.get("/get-all-users", userController.getAllUsers);

module.exports = router;

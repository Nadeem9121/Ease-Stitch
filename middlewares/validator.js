const { check } = require("express-validator");

const validateUserProfileUpdate = [
  check("username")
    .optional()
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters."),
  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other."),
  check("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number format."),
];

const validateAddress = [
  // Validate province
  check("address.province")
    .optional() // Field is optional
    .isString()
    .withMessage("Province must be a string.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Province must be between 2 and 50 characters."),

  // Validate city
  check("address.city")
    .optional() // Field is optional
    .isString()
    .withMessage("City must be a string.")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters."),

  // Validate address
  check("address.address")
    .optional() // Field is optional
    .isString()
    .withMessage("Address must be a string.")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters."),
];
const validatePasswordChange = [
  check("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  check("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

module.exports = {
  validateUserProfileUpdate,
  validateAddress,
  validatePasswordChange,
};

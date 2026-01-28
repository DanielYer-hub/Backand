const express = require("express");
const router = express.Router();
const { register, login, requestPasswordReset, verifyResetCode, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// Forget password flow: email -> code -> new password
router.post("/forget-password", requestPasswordReset);
router.post("/forget-password/verify", verifyResetCode);
router.post("/reset-password", resetPassword);

module.exports = router;

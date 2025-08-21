const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getUserInfo,getAllUsers, deleteUser, updateMe } = require("../controllers/userController");

router.get("/me", authMiddleware, getUserInfo);
router.get("/", authMiddleware, getAllUsers);
router.delete("/:id", authMiddleware, deleteUser);
router.patch("/me", authMiddleware, updateMe);

module.exports = router;

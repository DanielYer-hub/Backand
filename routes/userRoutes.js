const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadImage");
const { getUserInfo,getAllUsers, deleteUser, updateMe, uploadMyPhoto } = require("../controllers/userController");


router.get("/me", authMiddleware, getUserInfo);
router.get("/", authMiddleware, getAllUsers);
router.delete("/:id", authMiddleware, deleteUser);
router.patch("/me", authMiddleware, updateMe);
router.post("/me/photo", authMiddleware, upload.single('photo'), uploadMyPhoto);


module.exports = router;
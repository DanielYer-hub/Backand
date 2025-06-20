const express = require("express");
const router = express.Router();

// подключение контроллеров авторизации
const { register, login } = require("../controllers/authController");

// роуты
router.post("/register", register);
router.post("/login", login);

module.exports = router;

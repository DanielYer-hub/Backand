const User = require("../users/mongodb/Users");
const { generateUserPassword, comparePassword } = require("../users/helpers/bcrypt");
// const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const JWT_SECRET = "secret_warhammer_key";


const register = async (req, res) => {
  try {
    const { name, email, password, phone, region } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Пользователь уже существует" });

    const hash = generateUserPassword(password);

    const user = new User({
      name,
      email,
      password: hash,
      phone,
      region,
      points: 1000,
      planets: [], // потом добавим генерацию планет
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Пользователь создан",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        region: user.region,
        role: user.role,
        points: user.points,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка регистрации", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Неверный логин или пароль" });

    const match = comparePassword(password, user.password);
    if (!match) return res.status(400).json({ message: "Неверный логин или пароль" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Успешный вход",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        region: user.region,
        role: user.role,
        points: user.points,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка входа", error: err.message });
  }
};

module.exports = { register, login };

const User = require("../users/mongodb/Users");
const { generateUserPassword, comparePassword } = require("../users/helpers/bcrypt");
const jwt = require("jsonwebtoken");
const PLANET_POOL = require("../models/planetList");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

function getRandomPlanets(pool, count = 3) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const register = async (req, res) => {
  try {
    const { name, email, password, phone, region, faction } = req.body;
    const shuffled = [...PLANET_POOL].sort(() => 0.5 - Math.random());
    const homeland = shuffled[0];
    const planets = shuffled.slice(0, 3);
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hash = generateUserPassword(password);

    const user = new User({
      name,
      email,
      password: hash,
      phone,
      region,
      faction,
      points: 1000,
      planets,
      homeland,
      spaceports: 0,
      epicHeroes: 0,
      isStatic: false
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User created",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        region: user.region,
        role: user.role,
        points: user.points,
        planets: user.planets,  // Add planets to user object
        homeland: user.homeland, // Add homeland to user object
        faction: user.faction // Add faction to user object
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Incorrect login or password" });

    const match = comparePassword(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect login or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Successfully logged in",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        region: user.region,
        role: user.role,
        points: user.points,
        planets: user.planets,  // Add planets to user object
        homeland: user.homeland, // Add homeland to user object
        faction: user.faction // Add faction to user object
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

module.exports = { register, login };

const User = require("../users/mongodb/Users");
const { generateUserPassword, comparePassword } = require("../users/helpers/bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { name, email, password, region, address, settings = [], contacts = {} } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const normalizedContacts = {
      phoneE164: contacts.phoneE164 || "",
      telegramUsername: (contacts.telegramUsername || "").replace(/^@/, ""),
    };
    if (!normalizedContacts.phoneE164 && !normalizedContacts.telegramUsername) {
      return res.status(400).json({ message: "Provide WhatsApp phone or Telegram username" });
    }

    const hash = generateUserPassword(password);
    const user = new User({
      name,
      email,
      password: hash,
      region,
      address: address || undefined,
      settings,
      contacts: normalizedContacts,
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
        address: user.address, 
        role: user.role,
        settings: user.settings,
        contacts: user.contacts,
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
        settings: user.settings,
        address: user.address,     
        contacts: user.contacts,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

module.exports = { register, login };
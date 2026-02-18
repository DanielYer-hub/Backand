const User = require("../users/mongodb/Users");
const { generateUserPassword, comparePassword } = require("../users/helpers/bcrypt");
const jwt = require("jsonwebtoken");
const { sendPasswordResetCodeEmail } = require("../utils/mailer");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const RESET_CODE_TTL_MINUTES = Number(process.env.RESET_CODE_TTL_MINUTES || 10);

const register = async (req, res) => {
  try {
    const { name, email, password, region, address, settings, contacts } = req.body;
    if (!name?.first || !name?.last) {
      return res.status(400).json({ message: "First and last name are required" });
    }
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const normalizedContacts = {
      phoneE164: contacts?.phoneE164 || "",
      telegramUsername: (contacts?.telegramUsername || "").replace(/^@/, ""),
    };
    if (!normalizedContacts.phoneE164 && !normalizedContacts.telegramUsername) {
      return res.status(400).json({ message: "Provide WhatsApp phone or Telegram username" });
    }
    const hash = generateUserPassword(password);
    const user = new User({
      name,
      email,
      password: hash,
     region: region || undefined,
      address: address || { country: "", city: "" },
      settings: Array.isArray(settings) ? settings : [],
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

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
     
      return res.status(200).json({ message: "If this email exists, a code has been sent" });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    user.resetCode = code;
    user.resetCodeExpiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
    await user.save();

    await sendPasswordResetCodeEmail({ to: email, code });

    res.json({ message: "Reset code sent" });
  } catch (err) {
    res.status(500).json({ message: "Error sending reset code", error: err.message });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (new Date(user.resetCodeExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: "Code expired" });
    }

    if (String(user.resetCode) !== String(code)) {
      return res.status(400).json({ message: "Invalid code" });
    }

    res.json({ message: "Code verified" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying code", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code and new password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (new Date(user.resetCodeExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: "Code expired" });
    }

    if (String(user.resetCode) !== String(code)) {
      return res.status(400).json({ message: "Invalid code" });
    }

    user.password = generateUserPassword(newPassword);
    user.resetCode = null;
    user.resetCodeExpiresAt = null;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

module.exports = { register, login, requestPasswordReset, verifyResetCode, resetPassword };
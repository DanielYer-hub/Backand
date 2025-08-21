const User = require("../users/mongodb/Users");

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving users", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User has been deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error", error: err.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const allowed = ["factionText"]; // сейчас редактируем только заметку
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

    const user = await User.findByIdAndUpdate(req.user.id, patch, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: "Failed to update profile", error: e.message });
  }
};

module.exports = { getUserInfo, getAllUsers, deleteUser, updateMe };

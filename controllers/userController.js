const User = require("../users/mongodb/Users");
const path = require('path');
const cloudinary = require("../config/cloudinary");

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
    const me = req.user?.id;
    const { region, country, city } = req.query;
    const criteria = {};
    if (region) criteria.region = region;
    if (country) criteria["address.country"] = country;
    if (city) criteria["address.city"] = city;
    if (me) criteria._id = { $ne: me }; 

    const users = await User.find(criteria).select("-password"); 
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

function pickPatch(allowed, body) {
  const out = {};
  for (const path of allowed) {
    const keys = path.split(".");
    let src = body, ok = true;
    for (const k of keys) {
      if (src && Object.prototype.hasOwnProperty.call(src, k)) {
        src = src[k];
      } else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    let cursor = out;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        cursor[k] = src;
      } else {
        cursor[k] = cursor[k] || {};
        cursor = cursor[k];
      }
    });
  }
  return out;
}

const updateMe = async (req, res) => {
  try {
    const allowed = ["name.first", "name.last",
      "email",
      "region",
      "address.country", "address.city",
      "settings",
      "contacts.phoneE164", "contacts.telegramUsername",
      "bio",]; 
    const patch = pickPatch(allowed, req.body);
    if (patch.contacts) {
      if (typeof patch.contacts.telegramUsername === "string") {
        patch.contacts.telegramUsername = patch.contacts.telegramUsername.replace(/^@/, "");
      }
      if (typeof patch.contacts.phoneE164 === "string") {
        let p = patch.contacts.phoneE164.trim();
        p = p.replace(/(?!^\+)\D/g, "");
        if (!p.startsWith("+")) p = "+" + p.replace(/\D/g, "");
        patch.contacts.phoneE164 = p;
      }
    }
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      patch,
      { new: true, runValidators: true, context: "query" }
    ).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ user: updated });
  } catch (e) {
    res.status(500).json({ message: "Failed to update profile", error: e.message });
  }
};

const uploadMyPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const userId = req.user?.id || req.user?._id; 
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "gyw/avatars",
          resource_type: "image",
        },
        (err, uploadResult) => {
          if (err) return reject(err);
          resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });
    const user = await User.findByIdAndUpdate(
      userId,
      { image: { url: result.secure_url } },
      { new: true }
    );
    return res.json({ user });
  } catch (err) {
    console.error("uploadMyPhoto error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

module.exports = { getUserInfo, getAllUsers, deleteUser, updateMe, uploadMyPhoto };

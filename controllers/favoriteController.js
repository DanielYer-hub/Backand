const mongoose = require("mongoose");
const User = require("../users/mongodb/Users");

exports.getMyFavorites = async (req, res) => {
  const me = await User.findById(req.user.id).select("favorites").lean();
  if (!me) return res.status(404).json({ message: "User not found" });
  res.json({ favorites: (me.favorites || []).map(String) });
};

exports.toggleFavorite = async (req, res) => {
  const meId = req.user.id;
  const { playerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).json({ message: "Invalid player id" });
  }
  if (String(playerId) === String(meId)) {
    return res.status(400).json({ message: "You can't favorite yourself" });
  }

  const me = await User.findById(meId).select("favorites");
  if (!me) return res.status(404).json({ message: "User not found" });

  const favs = (me.favorites || []).map(String);
  const exists = favs.includes(String(playerId));

  if (exists) {
    me.favorites = me.favorites.filter((id) => String(id) !== String(playerId));
  } else {
    me.favorites.push(playerId);
  }

  await me.save();
  return res.json({
    favorites: (me.favorites || []).map(String),
    isFavorite: !exists,
  });
};

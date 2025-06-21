const User = require("../users/mongodb/Users");

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // не возвращаем пароли
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Ошибка получения пользователей", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json({ message: "Пользователь удален" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка удаления", error: err.message });
  }
};

module.exports = { getUserInfo, getAllUsers, deleteUser };

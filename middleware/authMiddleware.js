const jwt = require("jsonwebtoken");

// Просто жёстко прописанный ключ — временно
const JWT_SECRET = "secret_warhammer_key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Нет токена. Доступ запрещён." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id: ..., role: ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Недействительный токен" });
  }
};

module.exports = authMiddleware;

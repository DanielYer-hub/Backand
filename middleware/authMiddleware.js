const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded; 
    console.log("JWT decoded:", decoded);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid login." });
  }
};

module.exports = authMiddleware;

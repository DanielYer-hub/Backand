const cors = require("cors");

const corsmiddleware = cors({
  origin: [
    "http://localhost:5173",        
    "http://localhost:3000",        
    "http://127.0.0.1:5500",        
    "http://localhost:5500",
    "https://generic-your-way.onrender.com"
  ],

  credentials: true, 
});

module.exports = corsmiddleware;

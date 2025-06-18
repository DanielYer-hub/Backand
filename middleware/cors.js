const cors = require("cors");

const corsmiddleware = cors({
  origin: [
    "http://localhost:3000",        // для React-приложения
    "http://127.0.0.1:5500",        // если тестируешь HTML вручную
    "http://localhost:5500",
    "https://www.genericyourway.com" // твой продакшн-домен Важно: Убедись, что именно такой домен будет у твоего сайта на продакшене (https://www.genericyourway.com).
  ],

  credentials: true, // если используешь cookies или токены
});

module.exports = corsmiddleware;

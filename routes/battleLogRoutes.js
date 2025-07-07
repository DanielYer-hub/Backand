const express = require("express");
const router = express.Router();
const {
  createBattleLog,
  confirmBattle,
} = require("../controllers/battleLogController");

// Создание новой записи боя
router.post("/create", createBattleLog);

// Подтверждение боя (attacker или defender)
router.post("/confirm", confirmBattle);

module.exports = router;
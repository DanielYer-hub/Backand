const express = require("express");
const router = express.Router();
const {
  createBattleLog,
  confirmBattle,
  cancelBattle,
} = require("../controllers/battleLogController");
const { getBattleHistory } = require("../controllers/battleHistoryController");

router.post("/create", createBattleLog);
router.post("/confirm", confirmBattle);
router.get("/history/:userId", getBattleHistory);
router.post("/cancel", cancelBattle);


module.exports = router;
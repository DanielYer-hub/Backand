const express = require("express");
const router = express.Router();
const {
  createBattleLog,
  confirmBattle,
  cancelBattle,
} = require("../controllers/battleLogController");
const { getBattleHistory } = require("../controllers/battleHistoryController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createBattleLog);
router.post("/confirm", authMiddleware, confirmBattle);
router.get("/history/:userId", authMiddleware, getBattleHistory);
router.post("/cancel", authMiddleware, cancelBattle);


module.exports = router;
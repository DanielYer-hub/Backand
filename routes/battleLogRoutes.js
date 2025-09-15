const express = require("express");
const router = express.Router();
const {
  createBattleLog,
  confirmBattle,
  cancelBattle,
  incomingBattles,
  outgoingBattles,
  getBattle,
  setResult,
} = require("../controllers/battleLogController");
const { getBattleHistory } = require("../controllers/battleHistoryController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createBattleLog);
router.post("/confirm", authMiddleware, confirmBattle);
router.get("/history/:userId", authMiddleware, getBattleHistory);
router.post("/cancel", authMiddleware, cancelBattle);
router.get("/incoming", authMiddleware, incomingBattles);
router.get("/outgoing", authMiddleware, outgoingBattles);
router.get("/:id", authMiddleware, getBattle);
router.patch("/:id/result", authMiddleware, setResult);

module.exports = router;
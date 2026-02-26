const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { listMessages, sendMessage } = require("../controllers/chatController");

router.get("/:inviteId/messages", auth, listMessages);
router.post("/:inviteId/messages", auth, sendMessage);

module.exports = router;


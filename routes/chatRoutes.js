const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { listMessages, sendMessage, markRead, unreadCount, unreadByInvite } = require("../controllers/chatController");

router.get("/:inviteId/messages", auth, listMessages);
router.post("/:inviteId/messages", auth, sendMessage);

router.get("/unread-by-invite", auth, unreadByInvite);          
router.get("/:inviteId/unread-count", auth, unreadCount);       
router.patch("/:inviteId/read", auth, markRead);

module.exports = router;


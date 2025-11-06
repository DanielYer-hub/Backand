const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createInvite, incomingInvites, outgoingInvites, updateInviteStatus,  acceptInvite, declineInvite, cancelInvite  } = require("../controllers/inviteController");


router.post("/create", auth, createInvite);
router.get("/incoming", auth, incomingInvites);
router.get("/outgoing", auth, outgoingInvites);
router.post("/update", auth, updateInviteStatus);
router.post("/:id/accept",  auth, acceptInvite);
router.post("/:id/decline", auth, declineInvite);
router.post("/:id/cancel",  auth, cancelInvite);

module.exports = router;


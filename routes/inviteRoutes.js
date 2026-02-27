const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createInvite, incomingInvites, outgoingInvites, updateInviteStatus,  acceptInvite, declineInvite, cancelInvite, closeInvite } = require("../controllers/inviteController");


router.post("/create", auth, createInvite);
router.get("/incoming", auth, incomingInvites);
router.get("/outgoing", auth, outgoingInvites);
router.get("/incoming/count", auth, require("../controllers/inviteController").incomingInvitesCount); // New endpoint to get count of pending incoming invites
router.post("/update", auth, updateInviteStatus);
router.post("/:id/accept",  auth, acceptInvite);
router.post("/:id/decline", auth, declineInvite);
router.post("/:id/cancel",  auth, cancelInvite);
router.post("/:id/close", auth, closeInvite);

module.exports = router;


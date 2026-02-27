const Invite = require("../models/inviteModels");
const ChatMessage = require("../models/chatMessageModel");
const mongoose = require("mongoose");

function mapInviteForUser(invite, userId) {
  const isFrom = String(invite.fromUser._id || invite.fromUser) === String(userId);
  const isTo = String(invite.toUser._id || invite.toUser) === String(userId);
  const meRole = isFrom ? "from" : "to";

  const meClosed = meRole === "from" ? !!invite.closedByFrom : !!invite.closedByTo;
  const opponentClosed = meRole === "from" ? !!invite.closedByTo : !!invite.closedByFrom;

  const opponent = meRole === "from" ? invite.toUser : invite.fromUser;

  return {
    id: invite._id,
    status: invite.status,
    meRole,
    meClosed,
    opponentClosed,
    opponent: {
      id: opponent._id,
      name: opponent.name,
    },
    slot: invite.slot,
  };
}

exports.listMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId)
      .populate("fromUser", "name")
      .populate("toUser", "name");
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    const isFrom = String(invite.fromUser._id || invite.fromUser) === String(userId);
    const isTo = String(invite.toUser._id || invite.toUser) === String(userId);
    if (!isFrom && !isTo) {
      return res.status(403).json({ message: "Not your invite" });
    }

    if (invite.status !== "accepted") {
      return res.status(400).json({ message: "Chat available only for accepted invites" });
    }

    const bothClosed = invite.closedByFrom && invite.closedByTo;
    if (bothClosed) {
      return res.status(410).json({ message: "Chat session fully closed" });
    }

    const messages = await ChatMessage.find({ invite: inviteId })
      .sort({ createdAt: 1 })
      .select("fromUser toUser text createdAt readAt") // include readAt in the response
      .lean();

    res.json({
      invite: mapInviteForUser(invite, userId),
      messages: messages.map((m) => ({
        id: m._id,
        fromUser: m.fromUser,
        toUser: m.toUser,
        text: m.text,
        createdAt: m.createdAt,
        readAt: m.readAt || null, // null if not read yet
      })),
    });
  } catch (e) {
    console.error("listMessages error:", e);
    res.status(500).json({ message: "Failed to load chat", error: e?.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId } = req.params;
    const { text } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    const isFrom = String(invite.fromUser) === String(userId);
    const isTo = String(invite.toUser) === String(userId);
    if (!isFrom && !isTo) {
      return res.status(403).json({ message: "Not your invite" });
    }

    if (invite.status !== "accepted") {
      return res.status(400).json({ message: "Chat available only for accepted invites" });
    }

    if (isFrom && invite.closedByFrom) {
      return res.status(400).json({ message: "You already closed this chat" });
    }
    if (isTo && invite.closedByTo) {
      return res.status(400).json({ message: "You already closed this chat" });
    }

    const toUser = isFrom ? invite.toUser : invite.fromUser;
    const msg = await ChatMessage.create({
      invite: inviteId,
      fromUser: userId,
      toUser,
      text: text.trim(),
    });

    const opponentClosed = isFrom ? !!invite.closedByTo : !!invite.closedByFrom;

    res.status(201).json({
      message: {
        id: msg._id,
        fromUser: msg.fromUser,
        toUser: msg.toUser,
        text: msg.text,
        createdAt: msg.createdAt,
      },
      meta: {
        opponentClosed,
      },
    });
  } catch (e) {
    console.error("sendMessage error:", e);
    res.status(500).json({ message: "Failed to send message", error: e?.message });
  }
};

// New endpoint to mark messages as read
exports.markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    const isFrom = String(invite.fromUser) === String(userId);
    const isTo = String(invite.toUser) === String(userId);
    if (!isFrom && !isTo) return res.status(403).json({ message: "Not your invite" });

    if (invite.status !== "accepted") {
      return res.status(400).json({ message: "Chat available only for accepted invites" });
    }

    // ✅ mark all messages sent TO me as read
    const result = await ChatMessage.updateMany(
      { invite: inviteId, toUser: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({ updated: result.modifiedCount || result.nModified || 0 });
  } catch (e) {
    console.error("markRead error:", e);
    res.status(500).json({ message: "Failed to mark read", error: e?.message });
  }
};

// New endpoint to mark messages as read
exports.unreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    const isFrom = String(invite.fromUser) === String(userId);
    const isTo = String(invite.toUser) === String(userId);
    if (!isFrom && !isTo) return res.status(403).json({ message: "Not your invite" });

    if (invite.status !== "accepted") return res.json({ unread: 0 });

    const unread = await ChatMessage.countDocuments({
      invite: inviteId,
      toUser: userId,
      readAt: null,
    });

    res.json({ unread });
  } catch (e) {
    console.error("unreadCount error:", e);
    res.status(500).json({ message: "Failed to get unread count", error: e?.message });
  }
};

// New endpoint to get unread counts for all invites of the user
exports.unreadByInvite = async (req, res) => {
  try {
    const userId = req.user.id;

    const agg = await ChatMessage.aggregate([
      { $match: { toUser: new mongoose.Types.ObjectId(userId), readAt: null } },
      { $group: { _id: "$invite", count: { $sum: 1 } } },
    ]);

    const byInvite = {};
    let total = 0;
    for (const row of agg) {
      byInvite[String(row._id)] = row.count;
      total += row.count;
    }

    res.json({ byInvite, total });
  } catch (e) {
    console.error("unreadByInvite error:", e);
    res.status(500).json({ message: "Failed to load unread map", error: e?.message });
  }
};
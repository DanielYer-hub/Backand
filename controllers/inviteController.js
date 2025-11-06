const Invite = require("../models/inviteModels");
const User = require("../users/mongodb/Users");
const { buildContactLinks, buildSingleContact } = require("../utils/contactLink");

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

exports.createInvite = async (req, res) => {
  try {
    const fromUser = req.user?.id;
    const { targetUserId, message, slot } = req.body;

    if (!fromUser) return res.status(401).json({ message: "Not authenticated" });
    if (!targetUserId) return res.status(400).json({ message: "targetUserId is required" });
    if (!slot || typeof slot.day !== "number" || slot.day < 0 || slot.day > 6) {
      return res.status(400).json({ message: "slot.day must be 0..6" });
    }
    if (String(fromUser) === String(targetUserId)) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }
    const target = await User.findById(targetUserId).select("availability");
    if (!target) return res.status(404).json({ message: "Target not found" });
    const av = target.availability || { busyAllWeek:false, days:[] };
    if (av.busyAllWeek) return res.status(400).json({ message: "Target is busy all week" });
    const dayCfg = (av.days || []).find(d => d.day === slot.day);
    if (!dayCfg) return res.status(400).json({ message: "Day is not available" });

    const conflict = await Invite.findOne({
      toUser: targetUserId,
      "slot.day": slot.day,
      status: { $in: ["pending", "accepted"] }
    });
    if (conflict) return res.status(409).json({ message: "Day already booked" });

    const invite = await Invite.create({
      fromUser,
      toUser: targetUserId,
      message: message || "",
      slot: { day: slot.day, from: slot.from || null, to: slot.to || null }
    });

    res.status(201).json({ invite });
  } catch (e) {
    console.error("createInvite error:", e);
    res.status(500).json({ message: "Failed to create invite" });
  }
};

exports.incomingInvites = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await Invite.find({ toUser: userId, status: "pending" })
      .populate("fromUser", "name email region address.city contacts") 
      .lean();

  const invites = list.map(inv => {
  const dayName = inv.slot?.day !== undefined ? DAY_NAMES[inv.slot.day] : null;
  const from = inv.slot?.from || "";
  const to = inv.slot?.to || "";
  const timeRange = from && to ? `${from}–${to}` : from ? from : "";
  return {
    _id: inv._id,
    setting: inv.setting,
    fromUser: inv.fromUser,
    toUser: inv.toUser,
    createdAt: inv.createdAt,
    slot: inv.slot,
    slotReadable: dayName ? `${dayName}${timeRange ? ` (${timeRange})` : ""}` : null,
    opponentContact: buildSingleContact(inv.fromUser),
  };
});

    res.set("Cache-Control", "no-store");
    res.json({ invites });
  } catch (e) {
    console.error("incomingInvites error:", e);
    res.status(500).json({ message: "Failed to load incoming" });
  }
};

exports.outgoingInvites = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await Invite.find({ fromUser: userId, status: "pending" })
      .populate("toUser", "name email region address.city contacts")
      .lean();

  const invites = list.map(inv => {
  const dayName = inv.slot?.day !== undefined ? DAY_NAMES[inv.slot.day] : null;
  const from = inv.slot?.from || "";
  const to = inv.slot?.to || "";
  const timeRange = from && to ? `${from}–${to}` : from ? from : "";
  return {
    _id: inv._id,
    setting: inv.setting,
    fromUser: inv.fromUser,
    toUser: inv.toUser,
    createdAt: inv.createdAt,
    slot: inv.slot,
    slotReadable: dayName ? `${dayName}${timeRange ? ` (${timeRange})` : ""}` : null,
    opponentContact: buildSingleContact(inv.toUser),
  };
});

    res.set("Cache-Control", "no-store");
    res.json({ invites });
  } catch (e) {
    console.error("outgoingInvites error:", e);
    res.status(500).json({ message: "Failed to load outgoing" });
  }
};

exports.updateInviteStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { inviteId, action } = req.body; 
    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (String(invite.toUser) !== String(userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already resolved" });
    }
    invite.status = action === "accept" ? "accepted" : "declined";
    await invite.save();
    res.json({ invite });
  } catch (e) {
    res.status(500).json({ message: "Failed to update invite" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const inv = await Invite.findById(id)
      .populate("fromUser", "name contacts")
      .populate("toUser", "name contacts");

    if (!inv) return res.status(404).json({ message: "Invite not found" });
    if (String(inv.toUser._id) !== String(userId))
      return res.status(403).json({ message: "Not your invite" });
    if (inv.status !== "pending")
      return res.status(400).json({ message: "Invite already resolved" });

    inv.status = "accepted";
    await inv.save();

    const links = buildContactLinks(inv.fromUser); 

    res.json({
      message: "Accepted",
      inviteId: inv._id,
      opponent: { id: inv.fromUser._id, name: inv.fromUser.name },
      chat: { links }, 
    });
  } catch (e) {
    console.error("acceptInvite error:", e);
    res.status(500).json({ message: "Failed to accept" });
  }
};

exports.declineInvite = async (req, res) => {
  const { id } = req.params;
  const inv = await Invite.findById(id);
  if (!inv) return res.status(404).json({ message: "Invite not found" });
  if (String(inv.toUser) !== req.user.id) {
    return res.status(403).json({ message: "Not your invite" });
  }
  inv.status = "declined";
  await inv.save();
  res.json({ invite: inv });
};

exports.cancelInvite = async (req, res) => {
  const { id } = req.params;
  const inv = await Invite.findById(id);
  if (!inv) return res.status(404).json({ message: "Invite not found" });
  if (String(inv.fromUser) !== req.user.id) {
    return res.status(403).json({ message: "You can cancel only your outgoing invite" });
  }
  inv.status = "canceled";
  await inv.save();
  res.json({ invite: inv });
};
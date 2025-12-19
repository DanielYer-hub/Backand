const Invite = require("../models/inviteModels");
const User = require("../users/mongodb/Users");
const { buildContactLinks, buildSingleContact } = require("../utils/contactLink");
const { getMissingProfileFields, requireCompleteProfileOr } = require("../utils/profileGuard");

function slotToReadable(slot) {
  if (!slot) return null;

  const date = slot.date || "";
  const from = slot.from || "";
  const to = slot.to || "";
  const timeRange = from && to ? `${from}–${to}` : (from || "");

  if (!date) return null;
  return `${date}${timeRange ? ` ${timeRange}` : ""}`;
}

exports.createInvite = async (req, res) => {
  try {
    const fromUser = req.user?.id;
    const { targetUserId, message, slot, setting } = req.body;
    if (!slot || typeof slot.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(slot.date)) {
  return res.status(400).json({ message: "slot.date (YYYY-MM-DD) is required" });
}

const target = await User.findById(targetUserId).select("availability settings");
if (!target) return res.status(404).json({ message: "Target not found" });

const av = target.availability || { busyAllWeek:false, slots:[] };
if (av.busyAllWeek) return res.status(400).json({ message: "Target is busy all week" });

const slotCfg = (av.slots || []).find(s => s.date === slot.date);
if (!slotCfg) return res.status(400).json({ message: "Date is not available" });


const conflict = await Invite.findOne({
  "slot.date": slot.date,
  $or: [
    { toUser: targetUserId, status: "pending" },
    { fromUser: targetUserId, status: "pending" },
    { toUser: targetUserId, status: "accepted", closedByTo: { $ne: true } },
    { fromUser: targetUserId, status: "accepted", closedByFrom: { $ne: true } },
  ],
});
if (conflict) return res.status(409).json({ message: "Date already booked" });

const invite = await Invite.create({
  fromUser,
  toUser: targetUserId,
  message: message || "",
  slot: { date: slot.date, from: slot.from || null, to: slot.to || null },
  setting: setting || null,
});

res.status(201).json({ invite });

  } catch (e) {
    console.error("createInvite error:", e);
    res.status(500).json({ message: "Failed to create invite", error: e?.message });
  }
};

exports.incomingInvites = async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await Invite.find({
      toUser: userId,
      $or: [{ status: "pending" }, { status: "accepted", closedByTo: { $ne: true } }],
    })
      .populate("fromUser", "name email region address.city contacts")
      .lean();

    const invites = list.map((inv) => ({
      _id: inv._id,
      status: inv.status,
      setting: inv.setting,
      message: inv.message || "",
      fromUser: inv.fromUser,
      toUser: inv.toUser,
      createdAt: inv.createdAt,
      slot: inv.slot,
      slotReadable: slotToReadable(inv.slot), 
      opponentContacts: buildContactLinks(inv.fromUser || {}),
      opponentContact: buildSingleContact(inv.fromUser || {}),
    }));

    res.set("Cache-Control", "no-store");
    res.json({ invites });
  } catch (e) {
    console.error("incomingInvites error:", e);
    res.status(500).json({ message: "Failed to load incoming", error: e?.message });
  }
};

exports.outgoingInvites = async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await Invite.find({
      fromUser: userId,
      $or: [{ status: "pending" }, { status: "accepted", closedByFrom: { $ne: true } }],
    })
      .populate("toUser", "name email region address.city contacts")
      .lean();

    const invites = list.map((inv) => ({
      _id: inv._id,
      status: inv.status,
      setting: inv.setting,
      message: inv.message || "",
      fromUser: inv.fromUser,
      toUser: inv.toUser,
      createdAt: inv.createdAt,
      slot: inv.slot,
      slotReadable: slotToReadable(inv.slot), 
      opponentContacts: buildContactLinks(inv.toUser || {}),
      opponentContact: buildSingleContact(inv.toUser || {}),
    }));

    res.set("Cache-Control", "no-store");
    res.json({ invites });
  } catch (e) {
    console.error("outgoingInvites error:", e);
    res.status(500).json({ message: "Failed to load outgoing", error: e?.message });
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
    res.status(500).json({ message: "Failed to update invite", error: e?.message });
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
    if (String(inv.toUser._id) !== String(userId)) {
      return res.status(403).json({ message: "Not your invite" });
    }
    if (inv.status !== "pending") {
      return res.status(400).json({ message: "Invite already resolved" });
    }

    inv.status = "accepted";
    inv.closedByFrom = false;
    inv.closedByTo = false;
    inv.closedAtFrom = null;
    inv.closedAtTo = null;
    await inv.save();

    const links = buildContactLinks(inv.fromUser);
    res.json({
      message: "Accepted",
      inviteId: inv._id,
      inviteStatus: inv.status,
      opponent: { id: inv.fromUser._id, name: inv.fromUser.name },
      chat: { links },
    });
  } catch (e) {
    console.error("acceptInvite error:", e);
    res.status(500).json({ message: "Failed to accept", error: e?.message });
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

exports.closeInvite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const inv = await Invite.findById(id);
    if (!inv) return res.status(404).json({ message: "Invite not found" });

    const isFrom = String(inv.fromUser) === String(userId);
    const isTo = String(inv.toUser) === String(userId);
    if (!isFrom && !isTo) return res.status(403).json({ message: "Not your invite" });

    if (inv.status !== "accepted") {
      return res.status(400).json({ message: "You can close only accepted invites" });
    }

    if (isFrom) {
      inv.closedByFrom = true;
      inv.closedAtFrom = new Date();
    }
    if (isTo) {
      inv.closedByTo = true;
      inv.closedAtTo = new Date();
    }

    await inv.save();
    res.json({ invite: inv });
  } catch (e) {
    console.error("closeInvite error:", e);
    res.status(500).json({ message: "Failed to close invite", error: e?.message });
  }
};

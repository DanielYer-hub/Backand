const User = require("../users/mongodb/Users");
const Invite = require("../models/inviteModels");

function normalizeAvailability(av) {
  const busyAllWeek = !!av?.busyAllWeek;
  const slots =
    Array.isArray(av?.slots) ? av.slots :
    Array.isArray(av?.days)  ? av.days  : [];
  return {
    busyAllWeek,
    slots: slots.map(s => ({
      date: s?.date || "",
      ranges: Array.isArray(s?.ranges) ? s.ranges.map(r => ({
        from: r?.from || "18:00",
        to: r?.to || "22:00",
      })) : [],
    })),
  };
}


exports.getMyAvailability = async (req, res) => {
  const u = await User.findById(req.user.id).select("availability");
  if (!u) return res.status(404).json({ message: "User not found" });
  const availability = normalizeAvailability(u.availability);
  res.set("Cache-Control", "no-store");
  res.json({ availability });
};

exports.updateMyAvailability = async (req, res) => {
  const { busyAllWeek, slots } = req.body || {};
  if (slots && !Array.isArray(slots)) {
    return res.status(400).json({ message: "slots must be array" });
  }
  const nextSlots = (slots || []).map(s => ({
    date: s.date,
    ranges: Array.isArray(s.ranges) ? s.ranges : []
  }));

  const u = await User.findByIdAndUpdate(
    req.user.id,
    {
      "availability.busyAllWeek": !!busyAllWeek,
      "availability.slots": nextSlots,
    },
    { new: true }
  ).select("availability");
  res.set("Cache-Control", "no-store");
  res.json({ availability: normalizeAvailability(u.availability) });
};


exports.getPublicAvailability = async (req, res) => {
  const { id } = req.params;
  const u = await User.findById(id).select("availability");
  if (!u) return res.status(404).json({ message: "User not found" });
  const base = normalizeAvailability(u.availability);
  if (base.busyAllWeek) {
    return res.json({ availability: { busyAllWeek: true, slots: [] } });
  }
  const holds = await Invite.find({
    $or: [
      { toUser: id, status: "pending" },
      { fromUser: id, status: "pending" },
      { toUser: id, status: "accepted", closedByTo: { $ne: true } },
      { fromUser: id, status: "accepted", closedByFrom: { $ne: true } },
    ],
  }).select("slot.date");
  const blockedDates = new Set(
    holds.map(h => h.slot?.date).filter(d => typeof d === "string" && d)
  );
  const slots = (base.slots || []).filter(s => !blockedDates.has(s.date));
  res.set("Cache-Control", "no-store");
  res.json({ availability: { busyAllWeek: false, slots } });
};


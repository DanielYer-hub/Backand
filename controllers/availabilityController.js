const User = require("../users/mongodb/Users");
const Invite = require("../models/inviteModels");

exports.getMyAvailability = async (req, res) => {
  const u = await User.findById(req.user.id).select("availability");
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json({ availability: u.availability || { busyAllWeek:false, days:[] } });
};

exports.updateMyAvailability = async (req, res) => {
  const { busyAllWeek, days } = req.body || {};
  if (days && !Array.isArray(days)) return res.status(400).json({ message:"days must be array" });
  const u = await User.findByIdAndUpdate(
    req.user.id,
    { "availability.busyAllWeek": !!busyAllWeek, "availability.days": days || [] },
    { new:true }
  ).select("availability");
  res.json({ availability: u.availability });
};

exports.getPublicAvailability = async (req, res) => {
  const { id } = req.params; 
  const u = await User.findById(id).select("availability");
  if (!u) return res.status(404).json({ message: "User not found" });

  const base = u.availability || { busyAllWeek:false, days:[] };
  if (base.busyAllWeek) return res.json({ availability: { busyAllWeek:true, days:[] } });

  const holds = await Invite.find({ toUser:id, status: { $in:["pending","accepted"] } })
                      .select("slot.day");
  const blocked = new Set(holds.map(h => h.slot?.day).filter(d => d !== undefined));
  const days = (base.days || []).filter(d => !blocked.has(d.day));
  res.json({ availability: { busyAllWeek:false, days } });
};
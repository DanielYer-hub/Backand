const express = require("express");
const router = express.Router();
const User = require("../users/mongodb/Users");

const ALLOWED_PLACES = new Set(["tts", "home", "club"]);
const normPlace = (p) => {
  const x = String(p || "").trim().toLowerCase();
  return ALLOWED_PLACES.has(x) ? x : "";
};

router.get("/players", async (req, res) => {
  try {
    const { setting, country, city, date, from, place } = req.query;
    // const place = normPlace(req.query.place);
    const criteria = {};

    if (setting) criteria.settings = setting;
    if (country) criteria["address.country"] = country;
    if (city) criteria["address.city"] = city;

    criteria["availability.busyAllWeek"] = { $ne: true };

    if (date || from || place) {
  const rangesMatch = {};
  if (from) rangesMatch.from = { $lte: String(from) };
  if (place) rangesMatch.place = String(place);

  const slotMatch = {};
  if (date) slotMatch.date = String(date);
  if (Object.keys(rangesMatch).length) {
    slotMatch.ranges = { $elemMatch: rangesMatch };
  }

  criteria["availability.slots"] = { $elemMatch: slotMatch };
}

    // const slotElem = {};
    // if (date) {
    //   slotElem.date = String(date);
    // }
    // const rangeElem = {};
    // if (from) {
    //   rangeElem.from = { $lte: String(from) };
    // }
    // if (place) {
    //   rangeElem.place = place;
    // }
    // if (Object.keys(rangeElem).length) {
    //   slotElem.ranges = { $elemMatch: rangeElem };
    // }
    // if (Object.keys(slotElem).length) {
    //   criteria["availability.slots"] = { $elemMatch: slotElem };
    // } else if (place) {
    //   criteria["availability.slots"] = {
    //     $elemMatch: { ranges: { $elemMatch: { place } } },
    //   };
    // }

// if (date) {
//   if (from) {
//     criteria["availability.slots"] = {
//       $elemMatch: {
//         date: String(date),
//         ranges: { $elemMatch: { from: { $lte: from } } },
//       },
//     };
//   } else {
//     criteria["availability.slots"] = { $elemMatch: { date: String(date) } };
//   }
// }

    const players = await User.find(criteria)
      .select("name email region address settings image bio availability")
      .lean();

    res.json({ players });
  } catch (e) {
    res.status(500).json({ message: "Failed to load players", error: e.message });
  }
});


module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../users/mongodb/Users");
const auth = require("../middleware/authMiddleware");

const ALLOWED_PLACES = new Set(["tts", "home", "club"]);
const normPlace = (p) => {
  const x = String(p || "").trim().toLowerCase();
  return ALLOWED_PLACES.has(x) ? x : "";
};

router.get("/players", async (req, res) => {
  try {
    const { setting, country, city, date, from } = req.query;
    const place = normPlace(req.query.place);
    const criteria = {};

    if (setting) criteria.settings = setting;
    if (country) criteria["address.country"] = country;
    if (city) criteria["address.city"] = city;

    criteria["availability.busyAllWeek"] = { $ne: true };

    const slotElem = {};
    if (date) {
      slotElem.date = String(date);
    }
    const rangeElem = {};
    if (from) {
      rangeElem.from = { $lte: String(from) };
    }
    if (place) {
      rangeElem.place = place;
    }
    if (Object.keys(rangeElem).length) {
      slotElem.ranges = { $elemMatch: rangeElem };
    }
    if (Object.keys(slotElem).length) {
      criteria["availability.slots"] = { $elemMatch: slotElem };
    } else if (place) {
      criteria["availability.slots"] = {
        $elemMatch: { ranges: { $elemMatch: { place } } },
      };
    }
    const players = await User.find(criteria)
      .select("name email region address settings image bio availability")
      .lean();

    res.json({ players });
  } catch (e) {
    res.status(500).json({ message: "Failed to load players", error: e.message });
  }
});

// New route to get favorite players with the same filters
router.get("/players/favorites", auth, async (req, res) => {
  try {
    const { setting, country, city, date, from, place } = req.query;

    const me = await User.findById(req.user.id).select("favorites").lean();
    const favIds = (me?.favorites || []).map(String);

    if (!favIds.length) return res.json({ players: [] });

    const criteria = { _id: { $in: favIds } };

    if (setting) criteria.settings = String(setting);
    if (country) criteria["address.country"] = String(country);
    if (city) criteria["address.city"] = String(city);

    criteria["availability.busyAllWeek"] = { $ne: true };

    if (place) {
      criteria["availability.slots"] = {
        $elemMatch: {
          ranges: { $elemMatch: { place: String(place) } },
        },
      };
    }

    if (date) {
      if (from) {
        criteria["availability.slots"] = {
          $elemMatch: {
            date: String(date),
            ranges: {
              $elemMatch: {
                from: { $lte: String(from) },
                ...(place ? { place: String(place) } : {}),
              },
            },
          },
        };
      } else {
        criteria["availability.slots"] = {
          $elemMatch: {
            date: String(date),
            ...(place ? { ranges: { $elemMatch: { place: String(place) } } } : {}),
          },
        };
      }
    }

    const players = await User.find(criteria)
      .select("name email region address settings image bio availability")
      .lean();

    res.json({ players });
  } catch (e) {
    res.status(500).json({ message: "Failed to load favorites", error: e.message });
  }
});

module.exports = router;
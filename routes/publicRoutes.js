const express = require("express");
const router = express.Router();
const User = require("../users/mongodb/Users");

router.get("/players", async (req, res) => {
  try {
    const { setting, region, country, city, day, from } = req.query;
    const criteria = {};
    if (setting) criteria.settings = setting;
    if (region)  criteria.region = region;
    if (country) criteria["address.country"] = country;
    if (city)    criteria["address.city"] = city;
    criteria["availability.busyAllWeek"] = { $ne: true };
    if (day !== undefined) {
      const dayNum = Number(day);
      if (!isNaN(dayNum)) {
        if (from) {
          criteria["availability.days"] = {
            $elemMatch: {
              day: dayNum,
              ranges: { $elemMatch: { from: { $lte: from } } } 
            }};
        } else {
          criteria["availability.days"] = { $elemMatch: { day: dayNum } };
        }}}
    const players = await User.find(criteria)
      .select("name email region address settings image bio availability")
      .lean();
    res.json({ players });
  } catch (e) {
    res.status(500).json({ message: "Failed to load players", error: e.message });
  }
});


module.exports = router;

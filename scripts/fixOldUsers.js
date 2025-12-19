const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../users/mongodb/Users");

const uri = process.env.MONGO_LOCAL_URI || process.env.MONGO_ATLAS_URI;

async function fixOldUsers() {
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB:", uri.includes("localhost") ? "local" : "atlas");
  const updates = [];
  updates.push(
    User.updateMany(
      {
        $or: [
          { availability: { $exists: false } },
          { availability: null },
          { availability: { $type: "string" } } 
        ]
      },
      { $set: { availability: { busyAllWeek: false, slots: [] } } }
    )
  );
  updates.push(
    User.updateMany(
      { $or: [{ image: { $exists: false } }, { image: null }] },
      { $set: { image: { url: "" } } }
    )
  );
  updates.push(
    User.updateMany(
      { $or: [{ bio: { $exists: false } }, { bio: null }] },
      { $set: { bio: "" } }
    )
  );
  updates.push(
    User.updateMany(
      { $or: [{ settings: { $exists: false } }, { settings: null }] },
      { $set: { settings: [] } }
    )
  );
  updates.push(
    User.updateMany(
      { $or: [{ contacts: { $exists: false } }, { contacts: null }] },
      { $set: { contacts: { phoneE164: "", telegramUsername: "" } } }
    )
  );
  await Promise.all(updates);
  await User.updateMany(
  { "availability.slots": { $exists: true, $ne: null } },
  [
    {
      $set: {
        "availability.slots": {
          $map: {
            input: "$availability.slots",
            as: "s",
            in: {
              date: { $ifNull: ["$$s.date", ""] },
              ranges: {
                $map: {
                  input: { $ifNull: ["$$s.ranges", []] },
                  as: "r",
                  in: {
                    from: { $ifNull: ["$$r.from", "18:00"] },
                    to: { $ifNull: ["$$r.to", "22:00"] },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]
);


  console.log("✅ All old users normalized!");
  await mongoose.disconnect();
}

fixOldUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  });

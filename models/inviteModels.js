const mongoose = require("mongoose");
const { Schema } = mongoose;

const inviteSchema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "user", required: true },
    toUser:   { type: Schema.Types.ObjectId, ref: "user", required: true },

    setting:  { type: String },
    message:  { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "canceled"],
      default: "pending"
    },

    closedByFrom: { type: Boolean, default: false },
    closedByTo:   { type: Boolean, default: false },
   closedAtFrom: { type: Date, default: null },
   closedAtTo:   { type: Date, default: null },

    slot: {
      day:  { type: Number, min: 0, max: 6, required: true },
      from: { type: String, match: /^\d{2}:\d{2}$/, required: false },
      to:   { type: String, match: /^\d{2}:\d{2}$/, required: false },
    },
  },
  { timestamps: true }
);

inviteSchema.index(
  { toUser: 1, "slot.day": 1, status: 1 },
  { partialFilterExpression: { status: { $in: ["pending", "accepted"] } } }
);

module.exports = mongoose.model("invite", inviteSchema);


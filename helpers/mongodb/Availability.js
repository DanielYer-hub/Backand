const mongoose = require("mongoose");
const { Schema } = mongoose;

const AvailabilityRange = new Schema(
  {
    from: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, 
    to:   { type: String, required: true, match: /^\d{2}:\d{2}$/ }, 
      place: {
      type: String,
      enum: ["tts","home","club"],
      default: "club",
      required: true,
    },
  },
  { _id: false }
);

const AvailabilitySlot = new Schema(
  {
    date:   { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    ranges: { type: [AvailabilityRange], default: [] },
  },
  { _id: false }
);

const Availability = new Schema(
  {
    busyAllWeek: { type: Boolean, default: false },
    slots:       { type: [AvailabilitySlot], default: [] },
  },
  { _id: false }
);

module.exports = {
  AvailabilityRange,
  AvailabilitySlot,
  Availability,
};
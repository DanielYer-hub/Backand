const mongoose = require("mongoose");
const { Schema } = mongoose;

const AvailabilityRange = new Schema(
  {
    from: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, 
    to:   { type: String, required: true, match: /^\d{2}:\d{2}$/ }, 
  },
  { _id: false }
);

const AvailabilityDay = new Schema(
  {
    day:    { type: Number, min: 0, max: 6, required: true },
    ranges: { type: [AvailabilityRange], default: [] },
  },
  { _id: false }
);

const Availability = new Schema(
  {
    busyAllWeek: { type: Boolean, default: false },
    days:        { type: [AvailabilityDay], default: [] },
  },
  { _id: false }
);

module.exports = {
  AvailabilityRange,
  AvailabilityDay,
  Availability,
};
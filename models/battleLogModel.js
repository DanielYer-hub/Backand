// models/battleLog.js
const mongoose = require("mongoose");

const battleLogSchema = new mongoose.Schema({
  attackerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  defenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  result: {
    type: String,
    enum: ["win", "lose", "draw"],
    required: true,
  },
  planets: {
    type: String,
    required: true,
  },
    attackerPointsChange: {
    type: Number,
    default: 0,
  },
  defenderPointsChange: {
    type: Number,
    default: 0,
  },
  confirmedByAttacker: {
    type: Boolean,
    default: false,
  },
  confirmedByDefender: {
    type: Boolean,
    default: false,
  },
  pointsGiven: {
    type: Boolean,
    default: false,
  },
  editableUntil: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 часа
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("battleLog", battleLogSchema);

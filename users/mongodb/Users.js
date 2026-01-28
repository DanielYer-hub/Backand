const mongoose = require("mongoose");
const Name = require("../../helpers/mongodb/Name");
const { EMAIL } = require("../../helpers/mongodb/mongoseValidations");
const Image = require("../../helpers/mongodb/image");
const Address = require("../../helpers/mongodb/Address");
const Region = require("../../helpers/mongodb/Region");
const { Availability } = require("../../helpers/mongodb/Availability");

const userSchema = new mongoose.Schema({
  name: Name,
  email: EMAIL,
  password: {
    type: String,
    minLength: 7,
    required: true,
    trim: true,
  },
  bio: { type: String, default: "" },
  image: Image,
  address: Address,
  region: Region,
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
 
settings: {
    type: [String],
    default: [],    
  },
contacts: {
    phoneE164: { type: String, default: "" },              
    telegramUsername: { type: String, default: "" }         
  },

  availability: { type: Availability, default: () => ({ busyAllWeek: false, slots: [] }) },

  // Password reset via email code
  resetCode: { type: String, default: null },
  resetCodeExpiresAt: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.model("user", userSchema);
module.exports = User;
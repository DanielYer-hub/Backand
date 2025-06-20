const mongoose = require("mongoose");
const Name = require("../../helpers/mongodb/Name");
const { PHONE, EMAIL } = require("../../helpers/mongodb/mongoseValidations");
const Image = require("../../helpers/mongodb/image");
const Address = require("../../helpers/mongodb/Address");

const userSchema = new mongoose.Schema({
  name: Name,
  phone: PHONE,
  email: EMAIL,
  password: {
    type: String,
    minLength: 7,
    required: true,
    trim: true,
  },
  image: Image,
  address: Address,
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  region: {
    type: String,
    required: true,
    trim: true,
  },
  points: {
    type: Number,
    default: 1000,
  },
  planets: {
    type: [String], // Можем позже заменить на ObjectId если будут модели планет
    default: [],
  },
}, { timestamps: true });

const User = mongoose.model("user", userSchema);
module.exports = User;
const mongoose = require("mongoose");

const Address = new mongoose.Schema({
  country: { type: String, default: "" },
  city: { type: String, default: "" },
});

module.exports = Address;
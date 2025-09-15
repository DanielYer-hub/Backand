const mongoose = require("mongoose");
const { DEFAULT_VALIDATION } = require("./mongoseValidations");

const Address = new mongoose.Schema({
  country: DEFAULT_VALIDATION,
  city: DEFAULT_VALIDATION,
  street: DEFAULT_VALIDATION,
});

module.exports = Address;
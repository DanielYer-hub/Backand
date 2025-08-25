const mongoose = require("mongoose");
const { DEFAULT_VALIDATION } = require("./mongoseValidations");

const Address = new mongoose.Schema({
  // region: {
  //   type: String,
  //   maxLength: 256,
  //   trim: true,
  // },
  country: DEFAULT_VALIDATION,
  city: DEFAULT_VALIDATION,
  street: DEFAULT_VALIDATION,
});

module.exports = Address;
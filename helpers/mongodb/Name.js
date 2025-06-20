const mongoose = require("mongoose");
const { DEFAULT_VALIDATION } = require("./mongoseValidations");

const Name = new mongoose.Schema({
  first: DEFAULT_VALIDATION,
  last: DEFAULT_VALIDATION,
});
module.exports = Name;
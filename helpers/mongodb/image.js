const mongoose = require("mongoose");
const { DEFAULT_VALIDATION } = require("./mongoseValidations");

const Image = new mongoose.Schema({
    url: URL,
    alt: {...DEFAULT_VALIDATION, required: false, minLenght: 0},
});

module.exports = Image;
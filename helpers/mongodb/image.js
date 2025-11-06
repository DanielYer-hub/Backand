const mongoose = require("mongoose");
const { URL } = require("./mongoseValidations");

const Image = new mongoose.Schema({
    url: URL,
});

module.exports = Image;
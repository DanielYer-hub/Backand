const mongoose = require("mongoose");
const chalk = require("chalk");

const connectToLocalDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/GenericYourWay");
    console.log(chalk.bold.white.bgRed("Connected to MongoDB locally"));
  } catch (error) {
    console.error(chalk.red("Could not connect MongoDB locally"), error);
  }
};

module.exports = connectToLocalDB;
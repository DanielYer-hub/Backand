const morganLogger = require("./morgan/morganlogger");
require("dotenv").config();

const logger = process.env.LOGGER;

const loggerMiddleware = () => {
  if (logger === "morgan") {
    return morganLogger;
  }
};

module.exports = loggerMiddleware;
const loginValidation = require("./Joi/loginvalidation");
const registerValidation = require("./Joi/registerValidation");

const VALIDATOR = "Joi";

const validateRegistertion = (user) => {
  if (VALIDATOR === "Joi") {
    const { error } = registerValidation(user);
    if (error) return error.details.map((detail) => detail.message);
    return "";
  }
};

const validateLogin = (user) => {
  if (VALIDATOR === "Joi") {
    const { error } = loginValidation(user);
    console.log(error);
    if (error) return error.details.map((detail) => detail.message);
    return "";
  }
};

module.exports = { validateLogin, validateRegistertion };
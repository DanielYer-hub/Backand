const Joi = require("joi");

const registerValidation = (user) => {

const e164 = /^\+?[1-9]\d{6,14}$/;
const tgUser = /^[a-zA-Z0-9_]{5,32}$/;

  const contacts = Joi.object({
    phoneE164: Joi.string().pattern(e164).allow("", null),
    telegramUsername: Joi.string()
      .custom((val, helpers) => {
        if (!val) return val;
        const cleaned = String(val).replace(/^@/, "");
        if (!tgUser.test(cleaned)) return helpers.error("any.invalid");
        return cleaned; 
      })
      .allow("", null),
  }).custom((v, helpers) => {
    const hasWA = !!v?.phoneE164;
    const hasTG = !!v?.telegramUsername;
    if (!hasWA && !hasTG) {
      return helpers.message("Provide WhatsApp phone or Telegram username");
    }
    return v;
  });

  const schema = Joi.object({
    name: Joi.object()
      .keys({
        first: Joi.string().min(2).max(256).required(),
        middle: Joi.string().max(256).allow(""),
        last: Joi.string().min(2).max(256).required(),
      })
      .required(),

    email: Joi.string()
      .ruleset.regex(
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
      )
      .rule({ message: "Email must be a valid email address" })
      .required(),

    password: Joi.string()
      .ruleset.regex(
        /((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{7,20})/
      )
      .rule({
        message:
          "Password must contain al least one uppercase letter, lowercase letter, number and one special charecter. The minimum length 7 charchters",
      })
      .required(),

    image: Joi.object()
      .keys({
        url: Joi.string()
          .ruleset.regex(
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
          )
          .rule({ message: "Image must contain valid URL" })
          .allow(""),
      })
      .required(),

    address: Joi.object()
      .keys({
        country: Joi.string().required(),
        city: Joi.string().required(),
      })
      .required(),

       region: Joi.string()
      .valid(
        "North America",
        "Caribbean",
        "Central America",
        "South America",
        "Africa",
        "Middle East",
        "Europe",
        "Asia",
        "Australia and Oceania"
      )
      .required(),

    settings: Joi.array().items(Joi.string()).min(1).required(),
    
   contacts: contacts.required(),

    isPlayer: Joi.boolean().required(),
    isAdmin: Joi.boolean().allow(""),
  });

  return schema.validate(user);
};

module.exports = registerValidation;

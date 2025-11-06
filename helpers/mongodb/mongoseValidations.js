const DEFAULT_VALIDATION = {
  type: String,
  required: true,
  minLength: 2,
  maxLength: 256,
  trim: true,
};

const EMAIL = {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  unique: true,
  match: RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/),
};

const URL = {
  type: String,
  trim: true,
  lowercase: true,
 match: [
    /^(?:\/uploads\/[\w.\-]+|https?:\/\/(?:localhost|127\.0\.0\.1|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d+)?\/\S*)$/,
    "Invalid URL",
  ],
};

module.exports = { DEFAULT_VALIDATION,  EMAIL, URL };
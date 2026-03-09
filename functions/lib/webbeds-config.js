const crypto = require("crypto");

const WEBBEDS_CONFIG = {
  get baseUrl() { return process.env.WEBBEDS_BASE_URL || ""; },
  get username() { return process.env.WEBBEDS_USERNAME || ""; },
  get password() { return process.env.WEBBEDS_PASSWORD || ""; },
  get companyId() { return process.env.WEBBEDS_COMPANY_ID || ""; },
  source: "1",
  product: "hotel",
  language: "en",
  saudiArabiaCode: 167,
  turkeyCode: 5,
  meccaCityCode: 364,
  medinaCityCode: 365,
  currencyUSD: 520,
  currencyEUR: 413,
  currencyGBP: 416,
};

function md5Hash(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

function buildAuthHeader() {
  return {
    Username: WEBBEDS_CONFIG.username,
    Password: md5Hash(WEBBEDS_CONFIG.password),
  };
}

module.exports = { WEBBEDS_CONFIG, md5Hash, buildAuthHeader };

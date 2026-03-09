import crypto from "crypto";

export const WEBBEDS_CONFIG = {
  baseUrl: process.env.WEBBEDS_BASE_URL || "",
  username: process.env.WEBBEDS_USERNAME || "",
  password: process.env.WEBBEDS_PASSWORD || "",
  companyId: process.env.WEBBEDS_COMPANY_ID || "",
  source: "1",
  product: "hotel",
  language: "en",

  // City codes
  saudiArabiaCode: 4,
  turkeyCode: 5,
  meccaCityCode: 164,  // MAKKAH
  medinaCityCode: 174, // MADINAH

  // Currency codes
  currencyUSD: 520,
  currencyEUR: 413,
  currencyGBP: 416,
};

export function md5Hash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

export function buildAuthHeader(): { Username: string; Password: string } {
  return {
    Username: WEBBEDS_CONFIG.username,
    Password: md5Hash(WEBBEDS_CONFIG.password),
  };
}

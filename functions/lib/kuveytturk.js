const { XMLParser } = require("fast-xml-parser");
const { createHash } = require("crypto");

// ── Remote Config Key'leri (mobil ile aynı) ──
const RC_KEY_MERCHANT_ID = "kuveytturk_merchant_id";
const RC_KEY_CUSTOMER_ID = "kuveytturk_customer_id";
const RC_KEY_USERNAME = "kuveytturk_username";
const RC_KEY_PASSWORD = "kuveytturk_password";
const RC_KEY_IS_PRODUCTION = "kuveytturk_is_production";
const RC_KEY_OK_URL = "kuveytturk_ok_url";
const RC_KEY_FAIL_URL = "kuveytturk_fail_url";

// ── Test ortam bilgileri (RC ulaşılamazsa fallback) ──
const TEST_MERCHANT_ID = "57902";
const TEST_CUSTOMER_ID = "97228291";
const TEST_USERNAME = "TEPKVT2021";
const TEST_PASSWORD = "api123";

const TEST_BASE_URL = "https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home";
const PROD_BASE_URL = "https://sanalpos.kuveytturk.com.tr/ServiceGateWay/Home";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

// ── Remote Config cache (5 dakika) ──
let _rcCache = null;
let _rcCacheTime = 0;
const RC_CACHE_TTL = 5 * 60 * 1000; // 5 min

/**
 * Firebase Remote Config'den KuveytTürk ayarlarını oku (Admin SDK).
 * Mobil uygulama ile aynı key'leri kullanır.
 * 5 dakika cache'lenir; hata durumunda env vars / test değerlerine düşer.
 */
async function getKuveytTurkConfigFromRC(adminApp) {
  const now = Date.now();

  // Cache geçerliyse hızlı dön
  if (_rcCache && (now - _rcCacheTime) < RC_CACHE_TTL) {
    return _rcCache;
  }

  try {
    const { getRemoteConfig } = require("firebase-admin/remote-config");
    const rc = getRemoteConfig(adminApp);
    const template = await rc.getTemplate();
    const params = template.parameters || {};

    const rcVal = (key) => {
      const param = params[key];
      if (!param) return "";
      // defaultValue can be { value: "..." } or { useInAppDefault: true }
      const dv = param.defaultValue;
      if (dv && typeof dv.value === "string") return dv.value;
      return "";
    };

    const isProduction = rcVal(RC_KEY_IS_PRODUCTION) === "true";

    // Mobil ile aynı mantık: isProduction=false ise test credentials kullan
    // RC'deki değerler sadece isProduction=true olunca aktif
    let merchantId, customerId, userName, password, okUrl, failUrl;
    if (isProduction) {
      merchantId = rcVal(RC_KEY_MERCHANT_ID) || "";
      customerId = rcVal(RC_KEY_CUSTOMER_ID) || "";
      userName = rcVal(RC_KEY_USERNAME) || "";
      password = rcVal(RC_KEY_PASSWORD) || "";
      okUrl = rcVal(RC_KEY_OK_URL) || "";
      failUrl = rcVal(RC_KEY_FAIL_URL) || "";
    } else {
      merchantId = TEST_MERCHANT_ID;
      customerId = TEST_CUSTOMER_ID;
      userName = TEST_USERNAME;
      password = TEST_PASSWORD;
      okUrl = "";
      failUrl = "";
    }

    _rcCache = {
      merchantId, customerId, userName, password,
      baseUrl: isProduction ? PROD_BASE_URL : TEST_BASE_URL,
      isProduction, okUrl, failUrl,
    };
    _rcCacheTime = now;
    console.log(`[KuveytTurk] Remote Config loaded — production=${isProduction}, merchantId=${merchantId ? "SET" : "EMPTY"}`);
    return _rcCache;
  } catch (err) {
    console.warn("[KuveytTurk] Remote Config okunamadı, env/test fallback kullanılıyor:", err.message);
    // Fallback: env vars → test credentials
    return getKuveytTurkConfigFallback();
  }
}

/** Env var / test fallback (Remote Config ulaşılamazsa) */
function getKuveytTurkConfigFallback() {
  const isProduction = process.env.KUVEYTTURK_IS_PRODUCTION === "true";
  if (isProduction) {
    return {
      merchantId: process.env.KUVEYTTURK_MERCHANT_ID || "",
      customerId: process.env.KUVEYTTURK_CUSTOMER_ID || "",
      userName: process.env.KUVEYTTURK_USERNAME || "",
      password: process.env.KUVEYTTURK_PASSWORD || "",
      baseUrl: PROD_BASE_URL, isProduction: true, okUrl: "", failUrl: "",
    };
  }
  return {
    merchantId: TEST_MERCHANT_ID, customerId: TEST_CUSTOMER_ID,
    userName: TEST_USERNAME, password: TEST_PASSWORD,
    baseUrl: TEST_BASE_URL, isProduction: false, okUrl: "", failUrl: "",
  };
}

/** Senkron fallback (eski API uyumluluğu) */
function getKuveytTurkConfig() {
  if (_rcCache && (Date.now() - _rcCacheTime) < RC_CACHE_TTL) {
    return _rcCache;
  }
  return getKuveytTurkConfigFallback();
}

function isKuveytTurkConfigReady(config) {
  return Boolean(config.merchantId && config.customerId && config.userName && config.password);
}

function convertAmount(amount) { return Math.round(amount * 100); }

function convertCurrency(currency) {
  switch ((currency || "").toUpperCase()) {
    case "TRY": case "TL": return "0949";
    case "USD": return "0840";
    case "EUR": return "0978";
    default: return "0949";
  }
}

function sha1Base64(input) { return createHash("sha1").update(input, "utf8").digest("base64"); }
function hashedPassword(password) { return sha1Base64(password); }

function createPaymentHash(config, merchantOrderId, amount, okUrl, failUrl) {
  const hashStr = config.merchantId + merchantOrderId + amount.toString() + okUrl + failUrl + config.userName + hashedPassword(config.password);
  return sha1Base64(hashStr);
}

function createApprovalHash(config, merchantOrderId, amount) {
  const hashStr = config.merchantId + merchantOrderId + amount.toString() + config.userName + hashedPassword(config.password);
  return sha1Base64(hashStr);
}

function detectCardType(cardNumber) {
  const normalized = cardNumber.replace(/\D/g, "");
  if (normalized.startsWith("9792")) return "Troy";
  if (normalized.startsWith("4")) return "Visa";
  const firstTwo = Number(normalized.slice(0, 2));
  const firstFour = Number(normalized.slice(0, 4));
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) return "MasterCard";
  return "MasterCard";
}

function normalizePhone(phoneNumber) {
  if (!phoneNumber) return {};
  const normalized = phoneNumber.replace(/\D/g, "");
  if (!normalized) return {};
  if (normalized.startsWith("90") && normalized.length > 10) return { cc: "90", subscriber: normalized.slice(2) };
  if (normalized.startsWith("0") && normalized.length > 10) return { cc: "90", subscriber: normalized.slice(1) };
  return { cc: "90", subscriber: normalized };
}

function build3DPaymentXml(config, payload) {
  const formattedAmount = convertAmount(payload.amount);
  const currencyCode = convertCurrency(payload.currency);
  const cardType = detectCardType(payload.card.cardNumber);
  const hashData = createPaymentHash(config, payload.merchantOrderId, formattedAmount, payload.okUrl, payload.failUrl);
  const phone = normalizePhone(payload.phoneNumber);

  const cardHolderData = payload.email || phone.cc || phone.subscriber
    ? `
  <CardHolderData>
    ${payload.email ? `<Email>${payload.email}</Email>` : ""}
    ${phone.cc || phone.subscriber ? `<MobilePhone>${phone.cc ? `<Cc>${phone.cc}</Cc>` : ""}${phone.subscriber ? `<Subscriber>${phone.subscriber}</Subscriber>` : ""}</MobilePhone>` : ""}
  </CardHolderData>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <APIVersion>TDV2.0.0</APIVersion>
  <OkUrl>${payload.okUrl}</OkUrl>
  <FailUrl>${payload.failUrl}</FailUrl>
  <HashData>${hashData}</HashData>
  <MerchantId>${config.merchantId}</MerchantId>
  <CustomerId>${config.customerId}</CustomerId>
  <DeviceData>
    <DeviceChannel>02</DeviceChannel>
    <ClientIP>${payload.clientIp}</ClientIP>
  </DeviceData>${cardHolderData}
  <UserName>${config.userName}</UserName>
  <CardNumber>${payload.card.cardNumber.replace(/\s+/g, "")}</CardNumber>
  <CardExpireDateYear>${payload.card.cardExpireYear}</CardExpireDateYear>
  <CardExpireDateMonth>${payload.card.cardExpireMonth}</CardExpireDateMonth>
  <CardCVV2>${payload.card.cardCvv}</CardCVV2>
  <CardHolderName>${payload.card.cardHolderName}</CardHolderName>
  <CardType>${cardType}</CardType>
  <BatchID>0</BatchID>
  <TransactionType>Sale</TransactionType>
  <InstallmentCount>0</InstallmentCount>
  <Amount>${formattedAmount}</Amount>
  <DisplayAmount>${formattedAmount}</DisplayAmount>
  <CurrencyCode>${currencyCode}</CurrencyCode>
  <MerchantOrderId>${payload.merchantOrderId}</MerchantOrderId>
  <TransactionSecurity>3</TransactionSecurity>
  <SubMerchantId>0</SubMerchantId>
  <Description>Web Otel Rezervasyon Odemesi</Description>
  <IdentityTaxNumber>${payload.identityTaxNumber}</IdentityTaxNumber>
</KuveytTurkVPosMessage>`;
}

function build3DApprovalXml(config, merchantOrderId, amount, md) {
  const hashData = createApprovalHash(config, merchantOrderId, amount);
  return `<?xml version="1.0" encoding="UTF-8"?>
<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <APIVersion>TDV2.0.0</APIVersion>
  <HashData>${hashData}</HashData>
  <MerchantId>${config.merchantId}</MerchantId>
  <CustomerId>${config.customerId}</CustomerId>
  <UserName>${config.userName}</UserName>
  <TransactionType>Sale</TransactionType>
  <InstallmentCount>0</InstallmentCount>
  <Amount>${amount}</Amount>
  <MerchantOrderId>${merchantOrderId}</MerchantOrderId>
  <TransactionSecurity>3</TransactionSecurity>
  <KuveytTurkVPosAdditionalData>
    <AdditionalData>
      <Key>MD</Key>
      <Data>${md}</Data>
    </AdditionalData>
  </KuveytTurkVPosAdditionalData>
</KuveytTurkVPosMessage>`;
}

function decodeAuthResponse(authResponseRaw) {
  let decoded = authResponseRaw.replaceAll("+", " ");
  let remaining = 5;
  while (decoded.includes("%") && remaining > 0) {
    const previous = decoded;
    try { decoded = decodeURIComponent(decoded); } catch { break; }
    if (previous === decoded) break;
    remaining -= 1;
  }
  return decoded;
}

function findText(source, keys) {
  if (!source || typeof source !== "object") return "";
  const record = source;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
  }
  for (const value of Object.values(record)) {
    const nested = findText(value, keys);
    if (nested) return nested;
  }
  return "";
}

function parseAuthResponse(authResponseRaw) {
  const decoded = decodeAuthResponse(authResponseRaw);
  try {
    const parsed = xmlParser.parse(decoded);
    const responseCode = findText(parsed, ["ResponseCode"]);
    const responseMessage = findText(parsed, ["ResponseMessage"]);
    const merchantOrderId = findText(parsed, ["MerchantOrderId"]);
    const md = findText(parsed, ["MD"]);
    const amountText = findText(parsed, ["Amount"]);
    return { responseCode, responseMessage, merchantOrderId: merchantOrderId || undefined, md: md || undefined, amount: amountText ? Number(amountText) : undefined };
  } catch {
    return { responseCode: "PARSE_ERROR", responseMessage: "AuthenticationResponse parse edilemedi" };
  }
}

function parseProvisionResponse(xmlResponse) {
  try {
    const parsed = xmlParser.parse(xmlResponse);
    const responseCode = findText(parsed, ["ResponseCode"]);
    const responseMessage = findText(parsed, ["ResponseMessage"]);
    return { success: responseCode === "00", responseCode, responseMessage };
  } catch {
    return { success: false, responseCode: "PARSE_ERROR", responseMessage: "Provision yanıtı parse edilemedi" };
  }
}

module.exports = {
  getKuveytTurkConfig,
  getKuveytTurkConfigFromRC,
  isKuveytTurkConfigReady,
  build3DPaymentXml,
  build3DApprovalXml,
  parseAuthResponse,
  parseProvisionResponse,
};

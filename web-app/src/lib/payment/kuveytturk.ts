import { XMLParser } from "fast-xml-parser";
import { createHash } from "node:crypto";

const TEST_MERCHANT_ID = "57902";
const TEST_CUSTOMER_ID = "97228291";
const TEST_USERNAME = "TEPKVT2021";
const TEST_PASSWORD = "api123";

const TEST_BASE_URL = "https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home";
const PROD_BASE_URL = "https://sanalpos.kuveytturk.com.tr/ServiceGateWay/Home";

export interface KuveytTurkCardPayload {
  cardHolderName: string;
  cardNumber: string;
  cardExpireMonth: string;
  cardExpireYear: string;
  cardCvv: string;
}

export interface KuveytTurkInitPayload {
  merchantOrderId: string;
  amount: number;
  currency: string;
  card: KuveytTurkCardPayload;
  identityTaxNumber: string;
  email?: string;
  phoneNumber?: string;
  clientIp: string;
  okUrl: string;
  failUrl: string;
}

export interface KuveytTurkConfig {
  merchantId: string;
  customerId: string;
  userName: string;
  password: string;
  baseUrl: string;
}

export interface KuveytTurkAuthResult {
  responseCode: string;
  responseMessage: string;
  merchantOrderId?: string;
  md?: string;
  amount?: number;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

export function getKuveytTurkConfig(): KuveytTurkConfig {
  const isProduction = process.env.KUVEYTTURK_IS_PRODUCTION === "true";

  const merchantId = isProduction
    ? process.env.KUVEYTTURK_MERCHANT_ID || ""
    : process.env.KUVEYTTURK_MERCHANT_ID || TEST_MERCHANT_ID;
  const customerId = isProduction
    ? process.env.KUVEYTTURK_CUSTOMER_ID || ""
    : process.env.KUVEYTTURK_CUSTOMER_ID || TEST_CUSTOMER_ID;
  const userName = isProduction
    ? process.env.KUVEYTTURK_USERNAME || ""
    : process.env.KUVEYTTURK_USERNAME || TEST_USERNAME;
  const password = isProduction
    ? process.env.KUVEYTTURK_PASSWORD || ""
    : process.env.KUVEYTTURK_PASSWORD || TEST_PASSWORD;

  return {
    merchantId,
    customerId,
    userName,
    password,
    baseUrl: isProduction ? PROD_BASE_URL : TEST_BASE_URL,
  };
}

export function isKuveytTurkConfigReady(config: KuveytTurkConfig): boolean {
  return Boolean(config.merchantId && config.customerId && config.userName && config.password);
}

export function convertAmount(amount: number): number {
  return Math.round(amount * 100);
}

export function convertCurrency(currency: string): string {
  switch (currency.toUpperCase()) {
    case "TRY":
    case "TL":
      return "0949";
    case "USD":
      return "0840";
    case "EUR":
      return "0978";
    default:
      return "0949";
  }
}

function sha1Base64(input: string): string {
  return createHash("sha1").update(input, "utf8").digest("base64");
}

function hashedPassword(password: string): string {
  return sha1Base64(password);
}

export function createPaymentHash(
  config: KuveytTurkConfig,
  merchantOrderId: string,
  amount: number,
  okUrl: string,
  failUrl: string,
): string {
  const hashStr =
    config.merchantId +
    merchantOrderId +
    amount.toString() +
    okUrl +
    failUrl +
    config.userName +
    hashedPassword(config.password);
  return sha1Base64(hashStr);
}

export function createApprovalHash(
  config: KuveytTurkConfig,
  merchantOrderId: string,
  amount: number,
): string {
  const hashStr =
    config.merchantId +
    merchantOrderId +
    amount.toString() +
    config.userName +
    hashedPassword(config.password);
  return sha1Base64(hashStr);
}

function detectCardType(cardNumber: string): string {
  const normalized = cardNumber.replace(/\D/g, "");
  if (normalized.startsWith("9792")) return "Troy";
  if (normalized.startsWith("4")) return "Visa";

  const firstTwo = Number(normalized.slice(0, 2));
  const firstFour = Number(normalized.slice(0, 4));
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return "MasterCard";
  }

  return "MasterCard";
}

function normalizePhone(phoneNumber?: string): { cc?: string; subscriber?: string } {
  if (!phoneNumber) return {};

  const normalized = phoneNumber.replace(/\D/g, "");
  if (!normalized) return {};

  if (normalized.startsWith("90") && normalized.length > 10) {
    return { cc: "90", subscriber: normalized.slice(2) };
  }

  if (normalized.startsWith("0") && normalized.length > 10) {
    return { cc: "90", subscriber: normalized.slice(1) };
  }

  return { cc: "90", subscriber: normalized };
}

export function build3DPaymentXml(config: KuveytTurkConfig, payload: KuveytTurkInitPayload): string {
  const formattedAmount = convertAmount(payload.amount);
  const currencyCode = convertCurrency(payload.currency);
  const cardType = detectCardType(payload.card.cardNumber);
  const hashData = createPaymentHash(
    config,
    payload.merchantOrderId,
    formattedAmount,
    payload.okUrl,
    payload.failUrl,
  );
  const phone = normalizePhone(payload.phoneNumber);

  const cardHolderData = payload.email || phone.cc || phone.subscriber
    ? `
  <CardHolderData>
    ${payload.email ? `<Email>${payload.email}</Email>` : ""}
    ${phone.cc || phone.subscriber ? `<MobilePhone>${phone.cc ? `<Cc>${phone.cc}</Cc>` : ""}${phone.subscriber ? `<Subscriber>${phone.subscriber}</Subscriber>` : ""}</MobilePhone>` : ""}
  </CardHolderData>`
    : "";

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

export function build3DApprovalXml(
  config: KuveytTurkConfig,
  merchantOrderId: string,
  amount: number,
  md: string,
): string {
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

export function decodeAuthResponse(authResponseRaw: string): string {
  let decoded = authResponseRaw.replaceAll("+", " ");

  let remaining = 5;
  while (decoded.includes("%") && remaining > 0) {
    const previous = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
    if (previous === decoded) break;
    remaining -= 1;
  }

  return decoded;
}

function findText(source: unknown, keys: string[]): string {
  if (!source || typeof source !== "object") {
    return "";
  }

  const record = source as Record<string, unknown>;
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

export function parseAuthResponse(authResponseRaw: string): KuveytTurkAuthResult {
  const decoded = decodeAuthResponse(authResponseRaw);

  try {
    const parsed = xmlParser.parse(decoded);
    const responseCode = findText(parsed, ["ResponseCode"]);
    const responseMessage = findText(parsed, ["ResponseMessage"]);
    const merchantOrderId = findText(parsed, ["MerchantOrderId"]);
    const md = findText(parsed, ["MD"]);
    const amountText = findText(parsed, ["Amount"]);

    return {
      responseCode,
      responseMessage,
      merchantOrderId: merchantOrderId || undefined,
      md: md || undefined,
      amount: amountText ? Number(amountText) : undefined,
    };
  } catch {
    return {
      responseCode: "PARSE_ERROR",
      responseMessage: "AuthenticationResponse parse edilemedi",
    };
  }
}

export function parseProvisionResponse(xmlResponse: string): { success: boolean; responseCode: string; responseMessage: string } {
  try {
    const parsed = xmlParser.parse(xmlResponse);
    const responseCode = findText(parsed, ["ResponseCode"]);
    const responseMessage = findText(parsed, ["ResponseMessage"]);
    return {
      success: responseCode === "00",
      responseCode,
      responseMessage,
    };
  } catch {
    return {
      success: false,
      responseCode: "PARSE_ERROR",
      responseMessage: "Provision yanıtı parse edilemedi",
    };
  }
}

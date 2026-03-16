/**
 * Döviz Kuru Yönetim Sistemi
 * 
 * Günlük USD/TRY döviz kuru çekme ve cacheleme modülü.
 * Frankfurter.app API kullanır (ücretsiz, open source).
 */

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase/config";

// ═════════════════════════════════════════════════════════════════
// Type Definitions
// ═════════════════════════════════════════════════════════════════

export interface ExchangeRate {
  from: string;      // "USD"
  to: string;        // "TRY"
  rate: number;      // 32.50
  timestamp: Date;
}

export interface ExchangeRates {
  usdTry: number;
  source: string;
  updatedAt: Date;
  nextUpdateAt: Date;
}

// ═════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════

const FALLBACK_USD_TRY_RATE = 32.50;
const CACHE_DURATION_HOURS = 24; // 24 saat

// Firestore collection name
const EXCHANGE_RATES_COLLECTION = "exchange_rates";
const DAILY_RATE_DOC_ID = "daily";

// ═════════════════════════════════════════════════════════════════
// API Functions
// ═════════════════════════════════════════════════════════════════

/**
 * Frankfurter.app API'den güncel USD/TRY kurunu çeker
 * Ücretsiz, open source API - rate limit yok
 */
async function fetchUsdTryRateFromAPI(): Promise<number> {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=TRY");
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.rates || !data.rates.TRY) {
      throw new Error("Invalid API response format");
    }
    
    return data.rates.TRY;
  } catch (error) {
    console.error("Failed to fetch exchange rate from API:", error);
    throw error;
  }
}

/**
 * TCMB (Türkiye Cumhuriyet Merkez Bankası) API'den USD/TRY kurunu çeker
 * Yedek API olarak kullanılabilir
 */
async function fetchUsdTryRateFromTCMB(): Promise<number> {
  try {
    const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
    
    if (!response.ok) {
      throw new Error(`TCMB API request failed: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // XML'den USD/TRY kurunu parse et
    // USD kodu: "USD", TRY kodu: "TRY"
    const usdMatch = xmlText.match(/<Currency Kod="USD"[^>]*>[\s\S]*?<ForexBuying>([^<]+)<\/ForexBuying>/);
    
    if (!usdMatch || !usdMatch[1]) {
      throw new Error("Could not parse USD rate from TCMB XML");
    }
    
    // TCMB kuru 1 USD = X TRY formatında
    return parseFloat(usdMatch[1].replace(",", "."));
  } catch (error) {
    console.error("Failed to fetch exchange rate from TCMB:", error);
    throw error;
  }
}

// ═════════════════════════════════════════════════════════════════
// Firestore Functions
// ═════════════════════════════════════════════════════════════════

/**
 * Firestore'dan güncel döviz kurlarını çeker
 */
export async function getExchangeRatesFromFirestore(): Promise<ExchangeRates | null> {
  try {
    const docRef = doc(db, EXCHANGE_RATES_COLLECTION, DAILY_RATE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    // Timestamp'leri Date'e çevir
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const nextUpdateAt = data.nextUpdateAt?.toDate ? data.nextUpdateAt.toDate() : new Date(data.nextUpdateAt);
    
    return {
      usdTry: data.usdTry,
      source: data.source || "unknown",
      updatedAt,
      nextUpdateAt,
    };
  } catch (error) {
    console.error("Failed to get exchange rates from Firestore:", error);
    return null;
  }
}

/**
 * Firestore'a güncel döviz kurlarını kaydeder
 */
export async function saveExchangeRatesToFirestore(rates: Omit<ExchangeRates, "updatedAt">): Promise<void> {
  try {
    const docRef = doc(db, EXCHANGE_RATES_COLLECTION, DAILY_RATE_DOC_ID);
    
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);
    
    await setDoc(docRef, {
      usdTry: rates.usdTry,
      source: rates.source,
      updatedAt: serverTimestamp(),
      nextUpdateAt: nextUpdate,
    });
  } catch (error) {
    console.error("Failed to save exchange rates to Firestore:", error);
    throw error;
  }
}

// ═════════════════════════════════════════════════════════════════
// Public Functions
// ═════════════════════════════════════════════════════════════════

/**
 * Güncel USD/TRY döviz kurunu getir
 * Önce Firestore cache'i kontrol eder, gerekirse API'den çeker
 */
export async function getUsdTryRate(): Promise<number> {
  // 1. Environment variable'ı kontrol et
  const envRate = Number(process.env.NEXT_PUBLIC_USD_TRY_RATE);
  if (Number.isFinite(envRate) && envRate > 0) {
    return envRate;
  }
  
  // 2. Firestore cache'i kontrol et
  const cached = await getExchangeRatesFromFirestore();
  
  if (cached) {
    const now = new Date();
    
    // Cache hala geçerli mi?
    if (now < cached.nextUpdateAt) {
      console.log("Using cached exchange rate:", cached.usdTry);
      return cached.usdTry;
    }
  }
  
  // 3. API'den güncel kuru çek
  try {
    const rate = await fetchUsdTryRateFromAPI();
    
    // Firestore'a kaydet
    await saveExchangeRatesToFirestore({
      usdTry: rate,
      source: "frankfurter.app",
      nextUpdateAt: new Date(Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000),
    });
    
    console.log("Fetched and cached new exchange rate:", rate);
    return rate;
  } catch (apiError) {
    console.error("Failed to fetch from primary API, trying fallback...");
    
    // TCMB'yi dene
    try {
      const rate = await fetchUsdTryRateFromTCMB();
      
      await saveExchangeRatesToFirestore({
        usdTry: rate,
        source: "tcmb",
        nextUpdateAt: new Date(Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000),
      });
      
      console.log("Fetched from TCMB and cached:", rate);
      return rate;
    } catch (tcmbError) {
      console.error("All APIs failed, using fallback rate");
      
      // Son çare: cached rate'i kullan (varsa) veya fallback
      if (cached && cached.usdTry > 0) {
        console.log("Using stale cached rate:", cached.usdTry);
        return cached.usdTry;
      }
      
      return FALLBACK_USD_TRY_RATE;
    }
  }
}

/**
 * USD değerini TL'ye çevirir
 */
export async function usdToTryAsync(valueUsd: number): Promise<number> {
  if (!(valueUsd > 0)) return 0;
  
  const rate = await getUsdTryRate();
  return valueUsd * rate;
}

/**
 * Senkron USD → TL dönüşümü (cached rate kullanır)
 * Not: Bu fonksiyon server-side çalışmalı
 */
export function usdToTrySync(valueUsd: number, rate?: number): number {
  if (!(valueUsd > 0)) return 0;
  
  const effectiveRate = rate || Number(process.env.NEXT_PUBLIC_USD_TRY_RATE) || FALLBACK_USD_TRY_RATE;
  return valueUsd * effectiveRate;
}

/**
 * Döviz kurlarını manuel olarak senkronize eder
 * Admin panel veya cron job tarafından kullanılabilir
 */
export async function syncExchangeRates(): Promise<ExchangeRates> {
  const rate = await fetchUsdTryRateFromAPI();
  
  const now = new Date();
  const nextUpdate = new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);
  
  const rates: ExchangeRates = {
    usdTry: rate,
    source: "frankfurter.app",
    updatedAt: now,
    nextUpdateAt: nextUpdate,
  };
  
  await saveExchangeRatesToFirestore(rates);
  
  return rates;
}

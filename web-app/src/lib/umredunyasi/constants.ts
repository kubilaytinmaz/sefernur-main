/**
 * UmreDunyasi API Configuration
 *
 * umredunyasi.com API'sine bağlantı için gerekli sabitler.
 * API, Express + Prisma + PostgreSQL + Redis stack kullanır.
 */

export const UMREDUNYASI_CONFIG = {
  /** API base URL — env'den alınır, yoksa production varsayılan */
  baseURL:
    process.env.NEXT_PUBLIC_UMREDUNYASI_API_URL ||
    "https://umredunyasi.com/api",

  /** UmreDunyasi frontend URL — detay linkleri için */
  siteURL:
    process.env.NEXT_PUBLIC_UMREDUNYASI_SITE_URL || "https://umredunyasi.com",

  /** İstek zaman aşımı (ms) */
  timeout: 10_000,

  /** Next.js revalidate süresi (saniye) */
  revalidateSeconds: 300, // 5 dakika

  /** React Query staleTime (ms) */
  staleTimeMs: 5 * 60 * 1000, // 5 dakika

  /** Varsayılan tur limiti */
  defaultTourLimit: 6,
} as const;

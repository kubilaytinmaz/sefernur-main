"use client";

import {
    initRecaptcha,
    sendPhoneOTP,
    signInWithGoogle,
    verifyPhoneOTP,
} from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/auth";
import { ConfirmationResult } from "firebase/auth";
import {
    ArrowLeft,
    CheckCircle2,
    Globe,
    Headphones,
    Loader2,
    Lock,
    MapPin,
    Phone,
    Plane,
    Shield,
    Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

/* ────────── Phone Formatting ────────── */

/** Formats digits after country code as: XXX XXX XX XX */
function formatPhoneDisplay(raw: string): string {
  // Keep the +90 prefix, format the rest
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 2) return "+" + digits; // just country code

  const cc = digits.slice(0, 2); // "90"
  const rest = digits.slice(2, 12); // max 10 digits

  let formatted = "+" + cc;
  if (rest.length > 0) formatted += " " + rest.slice(0, 3);
  if (rest.length > 3) formatted += " " + rest.slice(3, 6);
  if (rest.length > 6) formatted += " " + rest.slice(6, 8);
  if (rest.length > 8) formatted += " " + rest.slice(8, 10);

  return formatted;
}

/** Strips formatting → E.164: +905551234567 */
function toE164(display: string): string {
  return "+" + display.replace(/\D/g, "");
}

/* ────────── Google SVG icon ────────── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ────────── Feature items for left panel ────────── */

const FEATURES = [
  {
    icon: Plane,
    title: "Umre & Hac Turları",
    description: "Onlarca farklı tur paketi arasından size en uygun olanını seçin.",
  },
  {
    icon: MapPin,
    title: "Transfer & Rehberlik",
    description: "Havalimanı transferi ve profesyonel rehber hizmeti ile konfor.",
  },
  {
    icon: Globe,
    title: "Vize İşlemleri",
    description: "Vize başvurunuzu tek panelden takip edin, eksik belgeleri tamamlayın.",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Yolculuk öncesi ve sonrası her an yanınızdayız.",
  },
];

const TRUST_ITEMS = [
  { icon: Shield, text: "256-bit SSL ile güvenli" },
  { icon: Star, text: "4.9/5 müşteri memnuniyeti" },
  { icon: CheckCircle2, text: "TURSAB lisanslı" },
];

/* ────────── Main Page ────────── */

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [phoneDisplay, setPhoneDisplay] = useState("+90");
  const phoneNumber = toE164(phoneDisplay);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow digits and leading +
    const cleaned = val.startsWith("+") ? "+" + val.slice(1).replace(/\D/g, "") : val.replace(/\D/g, "");
    // Ensure +90 prefix stays
    if (!cleaned.startsWith("+90")) {
      setPhoneDisplay("+90");
      return;
    }
    setPhoneDisplay(formatPhoneDisplay(cleaned));
  }, []);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Phone OTP ── */
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // initRecaptcha is now async — it awaits Enterprise config + renders the verifier
      const recaptchaVerifier = await initRecaptcha();
      const confirmation = await sendPhoneOTP(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: unknown) {
      console.error("Phone auth error:", err);
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code?: unknown }).code ?? "")
          : "";
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message ?? "")
          : "";

      if (code === "auth/invalid-app-credential") {
        setError(
          "reCAPTCHA doğrulaması başarısız. Firebase Console → Authentication → Settings → " +
          "reCAPTCHA Enterprise bölümünden key'in domain listesinde 'localhost' olduğunu kontrol edin."
        );
      } else if (code === "auth/invalid-phone-number") {
        setError("Geçersiz telefon numarası. Format: +90XXXXXXXXXX");
      } else if (code === "auth/too-many-requests") {
        setError("Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.");
      } else {
        setError(message || "SMS gönderilemedi. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;

    setError("");
    setLoading(true);

    try {
      const user = await verifyPhoneOTP(confirmationResult, otp);
      if (user) {
        setUser(user);
        router.push("/");
      }
    } catch (err: unknown) {
      setError("Geçersiz kod. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Google Sign-In ── */
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const user = await signInWithGoogle();
      if (user) {
        setUser(user);
        router.push("/");
      }
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code?: unknown }).code ?? "")
          : "";

      if (code === "auth/popup-closed-by-user") {
        // User closed — no error needed
      } else if (code === "auth/popup-blocked") {
        setError("Popup engellendi. Lütfen tarayıcı ayarlarınızdan popup'ları etkinleştirin.");
      } else {
        setError("Google ile giriş yapılamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* ────────────────────────────────────────────────
          LEFT PANEL — Branding & Info (hidden on mobile)
         ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-700 via-emerald-800 to-teal-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#34d39930,transparent_50%),radial-gradient(circle_at_80%_70%,#0d948840,transparent_50%)]" />

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-125 h-125 rounded-full bg-teal-600/15 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top — Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Sefernur</span>
            </div>
          </div>

          {/* Middle — Value proposition */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                Umre ve Hac
                <br />
                yolculuğunuz
                <br />
                <span className="text-emerald-300">burada başlıyor.</span>
              </h2>
              <p className="mt-4 text-emerald-100/80 text-lg max-w-md leading-relaxed">
                Tur, transfer, rehber ve vize hizmetlerini tek platformdan yönetin.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/15 transition-colors">
                    <f.icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-emerald-100/60 mt-0.5 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Trust badges */}
          <div className="flex flex-wrap gap-4">
            {TRUST_ITEMS.map((t) => (
              <div
                key={t.text}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-xs text-emerald-100/80"
              >
                <t.icon className="w-3.5 h-3.5 text-emerald-300" />
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          RIGHT PANEL — Auth Forms
         ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 lg:py-0">
        <div className="w-full max-w-110 space-y-8">
          {/* Mobile logo — visible only on small screens */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Plane className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-xl font-bold text-slate-900">Sefernur</span>
            </div>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {step === "phone" ? "Hoş Geldiniz" : "Doğrulama Kodu"}
            </h1>
            <p className="mt-2 text-slate-500">
              {step === "phone"
                ? "Hesabınıza giriş yapın veya yeni üye olun"
                : `${phoneDisplay} numarasına gönderilen 6 haneli kodu girin`}
            </p>
          </div>

          {/* ── Google Sign-In ── */}
          {step === "phone" ? (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    Google ile devam et
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  veya
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Phone form */}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      id="phone"
                      value={phoneDisplay}
                      onChange={handlePhoneChange}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Örn: +90 555 123 45 67
                  </p>
                </div>

                {/* Error */}
                {error ? (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "SMS Kodu Gönder"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── OTP Verification ── */
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                  className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-center text-2xl tracking-[0.4em] font-mono placeholder:text-slate-300 placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Error */}
              {error ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Doğrula ve Giriş Yap"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Telefon numarasını değiştir
              </button>
            </form>
          )}

          {/* Invisible reCAPTCHA anchor (hidden, used by Firebase Auth) */}
          <div id="recaptcha-container" />

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 leading-relaxed">
            Giriş yaparak{" "}
            <a href="/privacy" className="text-emerald-600 hover:underline">
              Gizlilik Politikası
            </a>{" "}
            ve{" "}
            <a href="/terms" className="text-emerald-600 hover:underline">
              Kullanım Koşulları
            </a>
            &apos;nı kabul etmiş olursunuz.
          </div>
        </div>
      </div>
    </div>
  );
}

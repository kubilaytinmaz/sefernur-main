"use client";

import {
    CreateVisaInput,
    createVisaApplication,
    uploadVisaFile,
} from "@/lib/firebase/domain";
import { useAuthStore } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle,
    ChevronDown,
    CreditCard,
    DollarSign,
    FileText,
    Loader2,
    MapPin,
    Plus,
    Shield,
    Trash2,
    Upload,
    User,
    X,
} from "lucide-react";
import {
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
    useCallback,
    useRef,
    useState,
} from "react";

/* ═════════════════════════════════════════════════════
   Static data — mirrors mobile visa_controller.dart
   ═══════════════════════════════════════════════════ */

const COUNTRIES = [
  "Suudi Arabistan",
  "İran",
  "Irak",
  "Suriye",
  "Ürdün",
  "Mısır",
  "Fas",
  "Tunus",
  "Cezayir",
] as const;

const CITIES: Record<string, string[]> = {
  "Suudi Arabistan": ["Mekke", "Medine", "Cidde", "Riyad"],
  İran: ["Tahran", "Meşhed", "İsfahan", "Kum"],
  Irak: ["Bağdat", "Kerbela", "Necef", "Erbil"],
  Suriye: ["Şam", "Halep"],
  Ürdün: ["Amman", "Akabe"],
  Mısır: ["Kahire", "İskenderiye", "Luxor"],
  Fas: ["Rabat", "Kazablanka", "Merakeş", "Fes"],
  Tunus: ["Tunus", "Kayrevan"],
  Cezayir: ["Cezayir", "Oran", "Konstantin"],
};

const PURPOSES = [
  { value: "umre", label: "Umre" },
  { value: "hac", label: "Hac" },
  { value: "visit", label: "Ziyaret" },
  { value: "turizm", label: "Turizm" },
  { value: "business", label: "İş" },
  { value: "education", label: "Eğitim" },
  { value: "medical", label: "Tedavi" },
] as const;

const VISA_FEES: Record<string, number> = {
  "Suudi Arabistan": 150,
  İran: 80,
  Irak: 100,
  Suriye: 60,
  Ürdün: 50,
  Mısır: 40,
  Fas: 60,
  Tunus: 50,
  Cezayir: 50,
};

const MARITAL_STATUSES = ["Bekar", "Evli", "Dul", "Boşanmış"] as const;

const STEPS = [
  { label: "Kişisel Bilgiler", icon: User },
  { label: "Seyahat Bilgileri", icon: MapPin },
  { label: "Belgeler", icon: FileText },
  { label: "Ödeme & Onay", icon: CreditCard },
] as const;

/* ═══════════════════════════════════════════
   Form state type
   ═════════════════════════════════════════ */

interface FormState {
  firstName: string;
  lastName: string;
  passportNumber: string;
  phone: string;
  email: string;
  address: string;
  maritalStatus: string;
  country: string;
  city: string;
  purpose: string;
  departureDate: string; // yyyy-MM-dd
  returnDate: string;
  userNote: string;
}

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  passportNumber: "",
  phone: "",
  email: "",
  address: "",
  maritalStatus: "",
  country: "",
  city: "",
  purpose: "",
  departureDate: "",
  returnDate: "",
  userNote: "",
};

/* ═══════════════════════════════════════════
   Main exported component
   ═════════════════════════════════════════ */

export default function VisaApplicationForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // File states
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");

  /* ── helpers ── */
  const set = useCallback(
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [],
  );

  const fee = VISA_FEES[form.country] ?? 0;

  /* ── validation per step ── */
  function validateStep(s: number): string | null {
    switch (s) {
      case 0:
        if (!form.firstName.trim()) return "Ad alanı zorunludur";
        if (!form.lastName.trim()) return "Soyad alanı zorunludur";
        if (!form.passportNumber.trim()) return "Pasaport numarası zorunludur";
        if (!form.phone.trim()) return "Telefon numarası zorunludur";
        if (!form.email.trim()) return "E-posta adresi zorunludur";
        if (!form.maritalStatus) return "Medeni durum seçiniz";
        return null;
      case 1:
        if (!form.country) return "Ülke seçiniz";
        if (!form.city) return "Şehir seçiniz";
        if (!form.purpose) return "Seyahat amacı seçiniz";
        if (!form.departureDate) return "Gidiş tarihi seçiniz";
        if (!form.returnDate) return "Dönüş tarihi seçiniz";
        if (form.departureDate && form.returnDate && form.returnDate <= form.departureDate)
          return "Dönüş tarihi gidiş tarihinden sonra olmalıdır";
        return null;
      case 2:
        if (!passportFile) return "Pasaport dosyası zorunludur";
        if (!photoFile) return "Fotoğraf dosyası zorunludur";
        if (!idFile) return "Kimlik belgesi zorunludur";
        return null;
      case 3:
        return null; // payment is optional
      default:
        return null;
    }
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  }

  function handlePrev() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  /* ── submit ── */
  async function handleSubmit() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    if (!user?.id) return;

    setSubmitting(true);
    setError("");
    try {
      // upload files
      const [passportUrl, photoUrl, idUrl] = await Promise.all([
        uploadVisaFile(user.id, passportFile!, "passport"),
        uploadVisaFile(user.id, photoFile!, "photo"),
        uploadVisaFile(user.id, idFile!, "id"),
      ]);

      const additionalUrls = await Promise.all(
        additionalFiles.map((f) => uploadVisaFile(user.id, f, "additional")),
      );

      let receiptUrl: string | undefined;
      if (receiptFile) {
        receiptUrl = await uploadVisaFile(user.id, receiptFile, "receipt");
      }

      const input: CreateVisaInput = {
        userId: user.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        passportNumber: form.passportNumber.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim() || undefined,
        maritalStatus: form.maritalStatus || undefined,
        country: form.country,
        city: form.city,
        purpose: form.purpose,
        departureDate: new Date(form.departureDate),
        returnDate: new Date(form.returnDate),
        fee,
        currency: "USD",
        userNote: form.userNote.trim() || undefined,
        requiredFileUrls: [passportUrl, photoUrl, idUrl],
        additionalFileUrls: additionalUrls,
        paymentReceiptUrl: receiptUrl,
      };

      const id = await createVisaApplication(input);
      setSubmittedId(id);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["visaApplications"] });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Başvuru gönderilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ── success screen ── */
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Başvurunuz Alındı!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Vize başvurunuz başarıyla oluşturuldu. Başvuru numaranız:
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-amber-700">{submittedId}</p>
          <p className="mt-3 text-xs text-slate-400">
            Başvurunuzun durumunu &quot;Başvurularım&quot; bölümünden takip edebilirsiniz.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 h-11 w-full rounded-xl bg-amber-600 text-sm font-medium text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    );
  }

  /* ── main form ── */
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8 pb-8">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Yeni Vize Başvurusu</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={step} />

        {/* Step Content */}
        <div className="px-6 py-6">
          {step === 0 && <PersonalStep form={form} set={set} />}
          {step === 1 && <TravelStep form={form} setForm={setForm} set={set} fee={fee} />}
          {step === 2 && (
            <DocumentsStep
              passportFile={passportFile}
              setPassportFile={setPassportFile}
              photoFile={photoFile}
              setPhotoFile={setPhotoFile}
              idFile={idFile}
              setIdFile={setIdFile}
              additionalFiles={additionalFiles}
              setAdditionalFiles={setAdditionalFiles}
            />
          )}
          {step === 3 && (
            <PaymentStep
              form={form}
              set={set}
              fee={fee}
              receiptFile={receiptFile}
              setReceiptFile={setReceiptFile}
            />
          )}

          {/* Error Message */}
          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={submitting}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-amber-600 text-sm font-medium text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              İleri
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Başvuruyu Gönder
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Step Indicator
   ═════════════════════════════════════════ */

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = i <= current;
          const isCurrent = i === current;
          return (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isCurrent
                      ? "bg-amber-600 text-white"
                      : isActive
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < current ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-[11px] leading-tight text-center ${
                    isCurrent ? "font-semibold text-amber-700" : isActive ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    i < current ? "bg-amber-400" : "bg-slate-200"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Step 0 — Personal Information
   ═════════════════════════════════════════ */

function PersonalStep({
  form,
  set,
}: {
  form: FormState;
  set: (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900">Kişisel Bilgileriniz</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Ad *" value={form.firstName} onChange={set("firstName")} placeholder="Adınız" />
        <Field label="Soyad *" value={form.lastName} onChange={set("lastName")} placeholder="Soyadınız" />
      </div>

      <Field
        label="Pasaport Numarası *"
        value={form.passportNumber}
        onChange={set("passportNumber")}
        placeholder="U12345678"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Telefon *" value={form.phone} onChange={set("phone")} placeholder="+90 555 123 4567" />
        <Field
          label="E-posta *"
          value={form.email}
          onChange={set("email")}
          placeholder="ornek@email.com"
          type="email"
        />
      </div>

      <SelectField
        label="Medeni Durum *"
        value={form.maritalStatus}
        onChange={set("maritalStatus")}
        placeholder="Seçiniz"
        options={MARITAL_STATUSES.map((s) => ({ value: s, label: s }))}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
        <textarea
          value={form.address}
          onChange={set("address")}
          rows={3}
          placeholder="Açık adresiniz (isteğe bağlı)"
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Step 1 — Travel Information
   ═════════════════════════════════════════ */

function TravelStep({
  form,
  setForm,
  set,
  fee,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  set: (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  fee: number;
}) {
  const cities = CITIES[form.country] ?? [];

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, country: e.target.value, city: "" }));
  };

  // Compute minimum date string (today)
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900">Seyahat Bilgileriniz</h3>

      <SelectField
        label="Gidilecek Ülke *"
        value={form.country}
        onChange={handleCountryChange}
        placeholder="Ülke seçiniz"
        options={COUNTRIES.map((c) => ({ value: c, label: c }))}
      />

      <SelectField
        label="Gidilecek Şehir *"
        value={form.city}
        onChange={set("city")}
        placeholder={form.country ? "Şehir seçiniz" : "Önce ülke seçiniz"}
        options={cities.map((c) => ({ value: c, label: c }))}
        disabled={!form.country}
      />

      <SelectField
        label="Seyahat Amacı *"
        value={form.purpose}
        onChange={set("purpose")}
        placeholder="Amaç seçiniz"
        options={PURPOSES.map((p) => ({ value: p.value, label: p.label }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Gidiş Tarihi *</label>
          <input
            type="date"
            value={form.departureDate}
            onChange={set("departureDate")}
            min={todayStr}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Dönüş Tarihi *</label>
          <input
            type="date"
            value={form.returnDate}
            onChange={set("returnDate")}
            min={form.departureDate || todayStr}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
          />
        </div>
      </div>

      {form.country ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <DollarSign className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm font-semibold text-amber-700">
            Vize Ücreti: ${fee}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Step 2 — Documents
   ═════════════════════════════════════════ */

function DocumentsStep({
  passportFile,
  setPassportFile,
  photoFile,
  setPhotoFile,
  idFile,
  setIdFile,
  additionalFiles,
  setAdditionalFiles,
}: {
  passportFile: File | null;
  setPassportFile: Dispatch<SetStateAction<File | null>>;
  photoFile: File | null;
  setPhotoFile: Dispatch<SetStateAction<File | null>>;
  idFile: File | null;
  setIdFile: Dispatch<SetStateAction<File | null>>;
  additionalFiles: File[];
  setAdditionalFiles: Dispatch<SetStateAction<File[]>>;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900">Gerekli Belgeler</h3>

      <FileField
        label="Pasaport *"
        description="Pasaport sayfalarının tamamı (PDF veya JPG)"
        file={passportFile}
        onFileChange={setPassportFile}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <FileField
        label="Fotoğraf *"
        description="Beyaz zemin üzerine 5x6 cm fotoğraf"
        file={photoFile}
        onFileChange={setPhotoFile}
        accept="image/*"
      />

      <FileField
        label="Kimlik Belgesi *"
        description="Nüfus cüzdanı veya kimlik kartı"
        file={idFile}
        onFileChange={setIdFile}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Additional files */}
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-slate-900">Ek Belgeler (İsteğe bağlı)</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Davet mektubu, rezervasyon belgesi vb.</p>

        {additionalFiles.length > 0 ? (
          <div className="space-y-2 mb-3">
            {additionalFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
              >
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 truncate flex-1">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setAdditionalFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <AdditionalFileButton
          onFiles={(files) => setAdditionalFiles((prev) => [...prev, ...files])}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Step 3 — Payment & Confirm
   ═════════════════════════════════════════ */

function PaymentStep({
  form,
  set,
  fee,
  receiptFile,
  setReceiptFile,
}: {
  form: FormState;
  set: (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  fee: number;
  receiptFile: File | null;
  setReceiptFile: Dispatch<SetStateAction<File | null>>;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900">Ödeme & Onay</h3>

      {/* Fee summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Vize Başvuru Ücreti</span>
          <span className="text-xl font-bold text-amber-700">${fee}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {form.country} — {PURPOSES.find((p) => p.value === form.purpose)?.label ?? form.purpose}
        </p>
      </div>

      {/* Bank info */}
      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Banka Havalesi / EFT</h4>
        <div className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">
          <span className="font-medium text-slate-500">Banka</span>
          <span className="text-slate-900">Ziraat Bankası</span>
          <span className="font-medium text-slate-500">Hesap Adı</span>
          <span className="text-slate-900">Sefernur Turizm</span>
          <span className="font-medium text-slate-500">IBAN</span>
          <span className="text-slate-900 font-mono text-xs">TR12 3456 7890 1234 5678 9012 34</span>
          <span className="font-medium text-slate-500">Açıklama</span>
          <span className="text-slate-900">Vize — Ad Soyad</span>
        </div>
      </div>

      {/* Receipt upload */}
      <FileField
        label="Dekont Yükle"
        description="Ödeme dekontunuzu yükleyebilirsiniz (isteğe bağlı)"
        file={receiptFile}
        onFileChange={setReceiptFile}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* User note */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Ek Not (İsteğe bağlı)
        </label>
        <textarea
          value={form.userNote}
          onChange={set("userNote")}
          rows={3}
          placeholder="Eklemek istediğiniz not varsa yazabilirsiniz."
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Security badge */}
      <div className="flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
        <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-700">Güvenli Başvuru</p>
          <p className="text-xs text-emerald-600">
            Bilgileriniz 256-bit SSL şifrelemesi ile korunmaktadır.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Başvuru Özeti</h4>
        <div className="grid grid-cols-[100px_1fr] gap-y-1.5 text-sm">
          <span className="text-slate-500">Ad Soyad</span>
          <span className="text-slate-900">{form.firstName} {form.lastName}</span>
          <span className="text-slate-500">Pasaport</span>
          <span className="text-slate-900">{form.passportNumber}</span>
          <span className="text-slate-500">Ülke / Şehir</span>
          <span className="text-slate-900">{form.country}, {form.city}</span>
          <span className="text-slate-500">Amaç</span>
          <span className="text-slate-900">
            {PURPOSES.find((p) => p.value === form.purpose)?.label ?? form.purpose}
          </span>
          <span className="text-slate-500">Tarih</span>
          <span className="text-slate-900">
            {form.departureDate && new Date(form.departureDate).toLocaleDateString("tr-TR")}
            {" → "}
            {form.returnDate && new Date(form.returnDate).toLocaleDateString("tr-TR")}
          </span>
          <span className="text-slate-500">Ücret</span>
          <span className="text-slate-900 font-semibold">${fee} USD</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Reusable primitives
   ═════════════════════════════════════════ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 pr-8 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

function FileField({
  label,
  description,
  file,
  onFileChange,
  accept,
}: {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500 mb-3">{description}</p>

      {file ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-700 truncate flex-1">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-xs text-amber-600 hover:text-amber-800 font-medium cursor-pointer"
          >
            Değiştir
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-amber-600 text-sm font-medium text-white hover:bg-amber-700 transition-colors cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Dosya Seç
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />
    </div>
  );
}

function AdditionalFileButton({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Upload className="h-4 w-4" />
        Dosya Ekle
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    </>
  );
}

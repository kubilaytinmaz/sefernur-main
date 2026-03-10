"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import { useSiteSettings } from "@/providers/site-settings-provider";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
    Clock,
    Headphones,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
} from "lucide-react";
import { useState, type FormEvent } from "react";

export default function ContactPage() {
  const settings = useSiteSettings();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, COLLECTIONS.CONTACT_MESSAGES), {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        subject: formState.subject,
        message: formState.message,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <Headphones className="w-3.5 h-3.5 mr-1.5" />
            7/24 Destek
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight">
            Size nasıl yardımcı olabiliriz?
          </h1>
          <p className="mt-3 text-emerald-100 max-w-xl text-lg">
            Sorularınız, önerileriniz veya rezervasyon talepleriniz için bize ulaşın.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-4 gap-4">
          <ContactCard
            icon={<Phone className="w-5 h-5" />}
            title="Telefon"
            value={settings.phone}
            sub={`Hafta içi ${settings.workingHours.weekdays}`}
            href={`tel:${settings.phone.replace(/\s/g, "")}`}
          />
          <ContactCard
            icon={<MessageCircle className="w-5 h-5" />}
            title="WhatsApp"
            value={settings.whatsapp}
            sub="7/24 Mesaj & Arama"
            href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
          />
          <ContactCard
            icon={<Mail className="w-5 h-5" />}
            title="E-posta"
            value={settings.email}
            sub="24 saat içinde yanıt"
            href={`mailto:${settings.email}`}
          />
          <ContactCard
            icon={<MapPin className="w-5 h-5" />}
            title="Adres"
            value={settings.address}
            sub="Merkez Ofis"
          />
        </div>
      </section>

      {/* Form + Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">İletişim Formu</h2>
            <p className="text-sm text-slate-500 mb-6">
              Formu doldurun, en kısa sürede size geri dönelim.
            </p>

            {submitted ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Mesajınız Alındı</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    En kısa sürede ekibimiz sizinle iletişime geçecektir.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    className="mt-4 text-sm text-emerald-700 font-medium hover:underline"
                  >
                    Yeni mesaj gönder
                  </button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                    <input
                      required
                      type="text"
                      value={formState.name}
                      onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => setFormState((s) => ({ ...s, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Konu</label>
                    <select
                      value={formState.subject}
                      onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="">Seçiniz</option>
                      <option value="reservation">Rezervasyon</option>
                      <option value="tour">Tur Bilgisi</option>
                      <option value="transfer">Transfer</option>
                      <option value="visa">Vize İşlemleri</option>
                      <option value="complaint">Şikayet / Öneri</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mesajınız</label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
                  {sending ? (
                    <>Gönderiliyor <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
                  ) : (
                    <>Gönder <Send className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" /> Çalışma Saatleri
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Pazartesi - Cuma</span>
                    <span className="font-medium text-slate-900">{settings.workingHours.weekdays}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cumartesi</span>
                    <span className="font-medium text-slate-900">{settings.workingHours.saturday}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pazar</span>
                    <span className={`font-medium ${settings.workingHours.sunday === "Kapalı" ? "text-red-500" : "text-slate-900"}`}>{settings.workingHours.sunday}</span>
                  </div>
                  <hr className="border-slate-100 my-2" />
                  <p className="text-xs text-slate-500">
                    WhatsApp destek hattımız 7/24 aktiftir.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Merkez Ofis
                </h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>{settings.fullAddress}</p>
                  <p>{settings.addressDetail}</p>
                  <p className="text-xs text-slate-400 pt-1">
                    {settings.addressNote}
                  </p>
                </div>
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 h-40">
                  <iframe
                    title="Sefernur Merkez Ofis"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${settings.mapCoordinates.lng - 0.008}%2C${settings.mapCoordinates.lat - 0.005}%2C${settings.mapCoordinates.lng + 0.008}%2C${settings.mapCoordinates.lat + 0.005}&layer=mapnik&marker=${settings.mapCoordinates.lat}%2C${settings.mapCoordinates.lng}`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${settings.mapCoordinates.lat}&mlon=${settings.mapCoordinates.lng}#map=16/${settings.mapCoordinates.lat}/${settings.mapCoordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                >
                  Büyük haritada görüntüle →
                </a>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-emerald-900 mb-2">Acil Durum Hattı</h3>
                <p className="text-sm text-emerald-700">
                  Seyahatiniz sırasında acil destek için:
                </p>
                <a
                  href={`tel:${settings.whatsapp.replace(/\s/g, "")}`}
                  className="mt-2 inline-flex items-center gap-2 text-emerald-800 font-semibold"
                >
                  <Phone className="w-4 h-4" /> {settings.whatsapp}
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
        {icon}
      </div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="font-semibold text-slate-900 mt-0.5">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </>
  );

  const cls = "rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow block";

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={cls}>
      {content}
    </div>
  );
}

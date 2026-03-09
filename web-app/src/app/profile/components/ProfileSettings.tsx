"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import {
    Bell,
    Check,
    ChevronRight,
    Copy,
    Gift,
    HelpCircle,
    LogOut,
    Shield,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileSettings() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const referralCode = user?.referralCode ?? "";

  const handleCopyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    logout();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    // For now, sign out and show a placeholder
    // Full deletion requires Firebase Admin SDK or Cloud Function
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    logout();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Referral Section */}
      <Card className="border-gray-100 overflow-hidden">
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5" />
            <h3 className="font-semibold">Referans Programı</h3>
          </div>
          <p className="text-sm text-emerald-100">
            Arkadaşlarınızı davet edin, her başarılı kayıtta ödül kazanın.
          </p>
        </div>
        <CardContent className="p-5">
          {referralCode ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Referans Kodunuz
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-sm text-gray-900 tracking-wider">
                    {referralCode}
                  </div>
                  <button
                    onClick={handleCopyReferral}
                    className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="Kopyala"
                  >
                    {copiedReferral ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Bu kodu arkadaşlarınızla paylaşarak hem siz hem arkadaşınız
                avantajlardan yararlanabilirsiniz.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">
              Referans kodunuz henüz oluşturulmadı. İlk rezervasyonunuzdan sonra
              otomatik olarak oluşturulacaktır.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-gray-100">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            Bildirim Ayarları
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Push Bildirimleri
                </p>
                <p className="text-xs text-gray-500">
                  Rezervasyon ve kampanya bildirimleri alın
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  E-posta Bildirimleri
                </p>
                <p className="text-xs text-gray-500">
                  Önemli güncellemeleri e-posta ile alın
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  emailNotifications ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    emailNotifications ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-gray-100">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Güvenlik
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Şifre Değiştir
                </p>
                <p className="text-xs text-gray-500">
                  Hesap şifrenizi güncelleyin
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  İki Faktörlü Doğrulama
                </p>
                <p className="text-xs text-gray-500">
                  Hesabınızı ekstra güvenlik katmanıyla koruyun
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="border-gray-100">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Destek
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Yardım Merkezi
                </p>
                <p className="text-xs text-gray-500">
                  Sıkça sorulan sorular ve destek
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Bize Ulaşın
                </p>
                <p className="text-xs text-gray-500">
                  info@sefernur.com | 0850 123 45 67
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <div className="space-y-3">
        {/* Logout */}
        <Button
          variant="outline"
          size="md"
          className="w-full justify-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </Button>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hesabımı Sil
          </button>
        ) : (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5">
              <h4 className="font-semibold text-red-800 mb-2">
                Hesabınızı silmek istediğinize emin misiniz?
              </h4>
              <p className="text-sm text-red-600 mb-4">
                Bu işlem geri alınamaz. Tüm verileriniz, rezervasyonlarınız ve
                favorileriniz kalıcı olarak silinecektir.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Vazgeç
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Evet, Hesabımı Sil
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

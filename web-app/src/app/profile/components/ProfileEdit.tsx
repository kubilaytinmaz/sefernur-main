"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { uploadProfileImage } from "@/lib/firebase/domain";
import { updateUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { Camera, Check, Loader2, User } from "lucide-react";
import { useRef, useState } from "react";

export default function ProfileEdit() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.imageUrl ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("User ID not found");
      return uploadProfileImage(user.id, file);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      imageUrl?: string;
    }) => {
      if (!user?.id) throw new Error("User ID not found");
      await updateUser(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phoneNumber: data.phoneNumber,
        ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
      });
    },
    onSuccess: (_, variables) => {
      if (user) {
        setUser({
          ...user,
          firstName: variables.firstName,
          lastName: variables.lastName,
          fullName: `${variables.firstName} ${variables.lastName}`.trim(),
          email: variables.email,
          phoneNumber: variables.phoneNumber,
          ...(variables.imageUrl ? { imageUrl: variables.imageUrl } : {}),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let imageUrl: string | undefined;
    if (selectedFile) {
      imageUrl = await uploadMutation.mutateAsync(selectedFile);
    }
    updateMutation.mutate({
      firstName,
      lastName,
      email,
      phoneNumber,
      imageUrl,
    });
  };

  const isSaving = uploadMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Profil Fotoğrafı</h3>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-emerald-50 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-emerald-300" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                JPG, PNG veya GIF formatında, maksimum 5MB boyutunda.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Fotoğraf Değiştir
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Kişisel Bilgiler</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ad
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Adınız"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Soyad
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Soyadınız"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telefon
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <Check className="w-4 h-4" />
                Değişiklikler kaydedildi
              </span>
            )}
            {updateMutation.isError && (
              <span className="text-sm text-red-500">
                Bir hata oluştu. Tekrar deneyin.
              </span>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Değişiklikleri Kaydet"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

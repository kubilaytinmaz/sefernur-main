/**
 * Guide Share Buttons Component
 * Rehber paylaşım butonları bileşeni
 */

"use client";

import { Facebook, Link2, Mail, MessageCircle, Twitter } from "lucide-react";
import { useCallback } from "react";

interface GuideShareButtonsProps {
  guideName: string;
  guideUrl: string;
  className?: string;
}

export function GuideShareButtons({ guideName, guideUrl, className = "" }: GuideShareButtonsProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.origin + guideUrl : guideUrl;
  const shareText = `${guideName} - Profesyonel Rehber Hizmeti`;

  const handleCopyLink = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
  }, [shareUrl]);

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ShareButton
        href={shareUrls.whatsapp}
        icon={<MessageCircle className="w-4 h-4" />}
        label="WhatsApp ile paylaş"
        color="green"
      />
      <ShareButton
        href={shareUrls.facebook}
        icon={<Facebook className="w-4 h-4" />}
        label="Facebook'ta paylaş"
        color="blue"
      />
      <ShareButton
        href={shareUrls.twitter}
        icon={<Twitter className="w-4 h-4" />}
        label="X'te (Twitter) paylaş"
        color="slate"
      />
      <ShareButton
        href={shareUrls.email}
        icon={<Mail className="w-4 h-4" />}
        label="E-posta ile paylaş"
        color="sky"
      />
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700"
        aria-label="Linki kopyala"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ShareButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: "green" | "blue" | "slate" | "sky";
}

function ShareButton({ href, icon, label, color }: ShareButtonProps) {
  const colorClasses = {
    green: "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700",
    slate: "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700",
    sky: "bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${colorClasses[color]}`}
      aria-label={label}
    >
      {icon}
    </a>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { ReservationStatus } from "@/types/reservation";
import { VisaStatus } from "@/types/visa";

type StatusType = ReservationStatus | VisaStatus | "read" | "unread";

const statusConfig: Record<
  StatusType,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Beklemede",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Onaylandı",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "İptal",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  completed: {
    label: "Tamamlandı",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  received: {
    label: "Alındı",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  processing: {
    label: "İşleniyor",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  rejected: {
    label: "Reddedildi",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  read: {
    label: "Okundu",
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  unread: {
    label: "Okunmadı",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

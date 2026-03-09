"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReservationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=reservations");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );
}

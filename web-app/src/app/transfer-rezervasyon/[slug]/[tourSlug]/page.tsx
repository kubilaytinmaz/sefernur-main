import { Suspense } from "react";
import BookingPageClient from "./_client";

export function generateStaticParams() {
  return [{ slug: "_", tourSlug: "_" }];
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Yükleniyor...</div>}>
      <BookingPageClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import OtelSonuclarPageClient from "./_client";

export default function OtelSonuclarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <OtelSonuclarPageClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import HotelsPageClient from "./_client";

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <HotelsPageClient />
    </Suspense>
  );
}

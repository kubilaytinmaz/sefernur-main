"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirect page for backward compatibility.
 * The routes page has been merged into the pricing page as a tab.
 */
export default function RoutesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/transfers/pricing?tab=routes");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
        <p className="text-sm text-gray-500">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}

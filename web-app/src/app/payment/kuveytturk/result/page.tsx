import { Suspense } from "react";
import KuveytTurkPaymentResultPage from "./_client";

export default function Page() {
  return (
    <Suspense>
      <KuveytTurkPaymentResultPage />
    </Suspense>
  );
}

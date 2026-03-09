import { Suspense } from "react";
import HotelDetailPage from "./_client";

export function generateStaticParams() {
  return [{ hotelId: "_" }];
}

export default function Page() {
  return (
    <Suspense>
      <HotelDetailPage />
    </Suspense>
  );
}

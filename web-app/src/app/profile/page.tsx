import { Suspense } from "react";
import ProfilePage from "./_client";

export default function Page() {
  return (
    <Suspense>
      <ProfilePage />
    </Suspense>
  );
}

import TourDetailPage from "./_client";

export function generateStaticParams() {
  return [{ tourId: "_" }];
}

export default function Page() {
  return <TourDetailPage />;
}

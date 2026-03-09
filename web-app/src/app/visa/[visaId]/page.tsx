import VisaDetailPage from "./_client";

export function generateStaticParams() {
  return [{ visaId: "_" }];
}

export default function Page() {
  return <VisaDetailPage />;
}

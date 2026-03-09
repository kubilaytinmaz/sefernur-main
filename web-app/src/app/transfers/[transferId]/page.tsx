import TransferDetailPage from "./_client";

export function generateStaticParams() {
  return [{ transferId: "_" }];
}

export default function Page() {
  return <TransferDetailPage />;
}

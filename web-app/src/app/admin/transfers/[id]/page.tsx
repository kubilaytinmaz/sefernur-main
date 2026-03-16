import { TRANSFERS } from "@/lib/data/transfers-data";
import TransferDetailPage from "./_client";

export function generateStaticParams() {
  return TRANSFERS.map((transfer) => ({
    id: transfer.id,
  }));
}

export default function Page() {
  return <TransferDetailPage />;
}

import { TransferReservationDetailClient } from "./_client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransferReservationDetailPage(props: PageProps) {
  const params = await props.params;
  return <TransferReservationDetailClient reservationId={params.id} />;
}

import { HotelReservationDetailClient } from "./_client";

export default function Page({ params }: { params: { id: string } }) {
  return <HotelReservationDetailClient reservationId={params.id} />;
}

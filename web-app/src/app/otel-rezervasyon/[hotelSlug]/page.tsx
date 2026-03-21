import { Metadata } from "next";
import HotelBookingClient from "./_client";

interface PageProps {
  params: Promise<{ hotelSlug: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    cityCode?: string;
    hotelName?: string;
    hotelImage?: string;
    hotelAddress?: string;
    stars?: string;
    preselectRoom?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hotelSlug } = await params;
  const hotelName = hotelSlug
    .replace(/-/g, " ")
    .replace(/\d+$/, "")
    .trim();

  return {
    title: `${hotelName} - Otel Rezervasyonu`,
    description: `${hotelName} için kolay ve güvenli online rezervasyon. En iyi fiyat garantisi.`,
    openGraph: {
      title: `${hotelName} - Rezervasyon`,
      description: `${hotelName} için online rezervasyon`,
    },
  };
}

export default async function HotelBookingPage() {
  return <HotelBookingClient />;
}

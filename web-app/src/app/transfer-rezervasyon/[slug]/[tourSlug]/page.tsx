import BookingPageClient from "./_client";

export function generateStaticParams() {
  return [{ slug: "_", tourSlug: "_" }];
}

export default function Page() {
  return <BookingPageClient />;
}

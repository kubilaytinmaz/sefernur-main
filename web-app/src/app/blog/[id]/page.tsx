import BlogDetailPage from "./_client";

export function generateStaticParams() {
  return [
    { id: "ailenizle-manevi-yolculuk" },
    { id: "erken-rezervasyon-avantaji" },
    { id: "umre-yolculugu-firsati" },
  ];
}

export default function Page() {
  return <BlogDetailPage />;
}

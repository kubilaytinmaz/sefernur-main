import GuideDetailPage from "./_client";

export function generateStaticParams() {
  return [{ guideId: "_" }];
}

export default function Page() {
  return <GuideDetailPage />;
}

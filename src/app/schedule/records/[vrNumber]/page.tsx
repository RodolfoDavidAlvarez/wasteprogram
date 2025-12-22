import DeliveryRecordPageClient from "./pageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { vrNumber: string };
}

export default function DeliveryRecordPage({ params }: PageProps) {
  return <DeliveryRecordPageClient vrNumber={decodeURIComponent(params.vrNumber)} />;
}





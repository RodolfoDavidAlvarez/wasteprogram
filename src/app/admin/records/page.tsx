import { Header } from "@/components/layout/Header";
import DeliveryRecordsIndexClient from "./pageClient";

export const dynamic = "force-dynamic";

export default function DeliveryRecordsIndexPage() {
  return (
    <div>
      <Header title="Delivery Records" subtitle="View and manage delivery documentation" />
      <div className="p-6">
        <DeliveryRecordsIndexClient />
      </div>
    </div>
  );
}



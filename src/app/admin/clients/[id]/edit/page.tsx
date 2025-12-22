import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ClientForm } from "@/components/clients/ClientForm";
import { prisma } from "@/lib/prisma";

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

async function getClient(id: string) {
  try {
    return await prisma.client.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return null;
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <Header
        title="Edit Client"
        subtitle={`Editing ${client.companyName}`}
      />
      <div className="p-6 max-w-4xl">
        <ClientForm
          initialData={{
            id: client.id,
            companyName: client.companyName,
            operationalContact: client.operationalContact,
            operationalEmail: client.operationalEmail,
            operationalPhone: client.operationalPhone,
            billingContact: client.billingContact || undefined,
            billingEmail: client.billingEmail || undefined,
            billingPhone: client.billingPhone || undefined,
            address: client.address,
            city: client.city,
            state: client.state,
            zipCode: client.zipCode,
            contractReference: client.contractReference || undefined,
            tippingFeeRate: client.tippingFeeRate,
            notes: client.notes || undefined,
          }}
        />
      </div>
    </div>
  );
}

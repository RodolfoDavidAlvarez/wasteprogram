import { Header } from "@/components/layout/Header"
import { IntakeForm } from "@/components/intake/IntakeForm"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function getClients() {
  if (!process.env.DATABASE_URL) return []

  return prisma.client.findMany({
    where: { status: "active" },
    select: {
      id: true,
      companyName: true,
      accountNumber: true,
      tippingFeeRate: true,
    },
    orderBy: { companyName: "asc" },
  })
}

export default async function NewIntakePage() {
  const clients = await getClients()

  return (
    <div>
      <Header
        title="New Waste Intake"
        subtitle="Create a new waste intake request"
      />
      <div className="p-6 max-w-4xl">
        <IntakeForm clients={clients} />
      </div>
    </div>
  )
}

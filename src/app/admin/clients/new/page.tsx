import { Header } from "@/components/layout/Header"
import { ClientForm } from "@/components/clients/ClientForm"

export default function NewClientPage() {
  return (
    <div>
      <Header
        title="New Client"
        subtitle="Add a new waste supplier to the system"
      />
      <div className="p-6 max-w-4xl">
        <ClientForm />
      </div>
    </div>
  )
}

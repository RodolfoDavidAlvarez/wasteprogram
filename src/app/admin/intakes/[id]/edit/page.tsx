import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface EditIntakePageProps {
  params: Promise<{ id: string }>;
}

async function getIntake(id: string) {
  try {
    return await prisma.wasteIntake.findUnique({
      where: { id },
      include: { client: true },
    });
  } catch (error) {
    console.error("Failed to fetch intake:", error);
    return null;
  }
}

export default async function EditIntakePage({ params }: EditIntakePageProps) {
  const { id } = await params;
  const intake = await getIntake(id);

  if (!intake) {
    notFound();
  }

  return (
    <div>
      <Header
        title="Edit Intake"
        subtitle={`Editing ${intake.ticketNumber}`}
      />
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <Link href={`/admin/intakes/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Intake
            </Button>
          </Link>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Intake Editing Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              Full intake editing functionality is currently under development. For now, you can:
            </p>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-2">
              <li>Create a new intake with the correct information</li>
              <li>Update status through the intake detail page</li>
              <li>Contact support for urgent changes</li>
            </ul>

            <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-semibold text-gray-900 mb-2">Current Intake Details:</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-500">Ticket:</dt>
                <dd className="font-mono">{intake.ticketNumber}</dd>
                <dt className="text-gray-500">Client:</dt>
                <dd>{intake.client.companyName}</dd>
                <dt className="text-gray-500">Status:</dt>
                <dd className="capitalize">{intake.status}</dd>
                <dt className="text-gray-500">Waste Type:</dt>
                <dd>{intake.wasteType}</dd>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  // Redirect to schedule page - this is the public landing page
  redirect("/schedule");
}

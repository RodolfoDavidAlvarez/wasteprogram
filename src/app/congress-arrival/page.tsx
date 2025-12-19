"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type FormState = {
  visitType: string;
  referenceNumber: string;
  driverName: string;
  company: string;
  phone: string;
  material: string;
  equipment: string;
  estimate: string;
  notes: string;
};

type Status = "idle" | "sending" | "success" | "error";

const initialForm: FormState = {
  visitType: "loading",
  referenceNumber: "",
  driverName: "",
  company: "",
  phone: "",
  material: "",
  equipment: "",
  estimate: "",
  notes: "",
};

export default function CongressArrivalPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [showExtras, setShowExtras] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    // Require at least one helpful detail so operations gets a useful ping.
    const hasDetail =
      form.referenceNumber.trim() ||
      form.driverName.trim() ||
      form.phone.trim() ||
      form.notes.trim();

    if (!hasDetail) {
      setError("Add a reference, driver, phone, or note so ops knows who you are.");
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch("/api/congress-arrival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not send notification.");
      }

      setStatus("success");
      setForm(initialForm);
      setShowExtras(false);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send notification.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800">Congress, AZ</Badge>
            <Badge variant="outline" className="border-primary/50 text-primary">
              Driver check-in
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Quick notify for loading at the Congress Arizona plant
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Scan, tap notify, and drop a reference or your name. Everything else is optional.
            We&apos;ll ping SSW ops via SMS immediately.
          </p>
        </div>

        <Card className="border border-border bg-white">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium">Notify operations you&apos;re here</p>
              <p className="text-sm text-muted-foreground">
                Reference or driver name helps the most. Add more if you have it.
              </p>
            </div>

            {status === "success" && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                Notified SSW ops. You&apos;re in the queue.
              </div>
            )}
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Purpose at site"
                  value={form.visitType}
                  onChange={handleChange("visitType")}
                  options={[
                    { value: "loading", label: "Loading / pickup" },
                    { value: "dropoff", label: "Dropping material" },
                    { value: "swap", label: "Swap / backhaul" },
                    { value: "unsure", label: "Not sure" },
                  ]}
                />
                <Input
                  label="Reference or ticket #"
                  placeholder="VR / BOL / way ticket"
                  value={form.referenceNumber}
                  onChange={handleChange("referenceNumber")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Driver name"
                  placeholder="Name on arrival"
                  value={form.driverName}
                  onChange={handleChange("driverName")}
                />
                <Input
                  label="Carrier / company"
                  placeholder="Trucking co. or client"
                  value={form.company}
                  onChange={handleChange("company")}
                />
              </div>

              <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Optional details</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExtras((prev) => !prev)}
                    className="h-9"
                  >
                    {showExtras ? "Hide" : "Add"} extras
                  </Button>
                </div>

                {showExtras && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Phone for updates"
                        placeholder="We’ll text from ops"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        inputMode="tel"
                      />
                      <Input
                        label="Equipment IDs"
                        placeholder="Truck / trailer"
                        value={form.equipment}
                        onChange={handleChange("equipment")}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Material / load description"
                        placeholder="Feedstock, digestate, pallets..."
                        value={form.material}
                        onChange={handleChange("material")}
                      />
                      <Input
                        label="Estimate"
                        placeholder="Tons / pallets / containers"
                        value={form.estimate}
                        onChange={handleChange("estimate")}
                      />
                    </div>

                    <Textarea
                      label="Notes"
                      placeholder="Gate notes, window, who scheduled you, special handling."
                      value={form.notes}
                      onChange={handleChange("notes")}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Share at least one detail; everything else is optional.
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="sm:w-auto"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Notifying..." : "Notify that I’m here"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-md border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
          Congress Arizona Plant · 10725 W Hwy 71, Congress, AZ · Gates: 6:00a – 6:00p
        </div>
      </div>
    </div>
  );
}

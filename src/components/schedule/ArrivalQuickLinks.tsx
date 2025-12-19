"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link2 } from "lucide-react";

type Props = {
  appUrl?: string;
};

export function ArrivalQuickLinks({ appUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const arrivalUrl = useMemo(() => {
    if (appUrl && appUrl.trim()) return `${appUrl.replace(/\/$/, "")}/congress-arrival`;
    if (typeof window !== "undefined") return `${window.location.origin}/congress-arrival`;
    return "/congress-arrival";
  }, [appUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(arrivalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy arrival URL:", error);
    }
  }

  return (
    <Card className="border-border/80 bg-white">
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Driver arrival page</p>
          <p className="text-sm text-muted-foreground">
            Share or open the Congress, AZ QR landing page.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input value={arrivalUrl} readOnly className="bg-muted/40 text-sm" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="min-w-[96px]">
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
              <a
                href="/congress-arrival"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Open
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

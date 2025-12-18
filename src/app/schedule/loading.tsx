import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen schedule-theme app-background flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-md bg-card px-4 py-3 shadow-sm mb-4 border border-border">
          <Image
            src="/betterai-logo.svg"
            alt="BetterAI Systems"
            width={340}
            height={96}
            priority
            unoptimized
            className="h-10 sm:h-12 w-auto animate-logo-flash"
          />
        </div>
        <div className="text-muted-foreground font-medium">⏳ Loading schedule…</div>
      </div>
    </div>
  );
}

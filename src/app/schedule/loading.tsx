export default function Loading() {
  return (
    <div className="min-h-screen schedule-theme app-background flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-md bg-card px-4 py-3 shadow-sm mb-4 border border-border">
          <img
            src="/betterai-logo.svg"
            alt="BetterAI Systems"
            className="h-10 sm:h-12 w-auto animate-logo-flash"
          />
        </div>
        <div className="text-muted-foreground font-medium">⏳ Loading schedule…</div>
      </div>
    </div>
  );
}

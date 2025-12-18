import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen schedule-theme app-background flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-md bg-card px-3 py-2 shadow-sm mb-4 border border-border">
          <div className="relative h-16 sm:h-20 aspect-[2083/729] animate-pulse">
            <Image
              src="/ssw-logo.png"
              alt="Soil Seed & Water"
              fill
              priority
              unoptimized
              sizes="(min-width: 640px) 229px, 183px"
              className="object-contain"
            />
          </div>
        </div>
        <div className="text-muted-foreground">Loading schedule...</div>
        <div className="mt-4 flex justify-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🌱</div>
        <div className="text-lg font-semibold text-emerald-700 mb-2">Soil Seed & Water</div>
        <div className="text-gray-500">Loading schedule...</div>
        <div className="mt-4 flex justify-center gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}

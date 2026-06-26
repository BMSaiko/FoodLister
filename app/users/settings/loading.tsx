export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-6 h-6 border-2 border-gray-600 border-t-amber-500 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-white/40">Carregando...</p>
      </div>
    </div>
  );
}

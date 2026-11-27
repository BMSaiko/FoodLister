import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Skeleton variant="list-card" count={6} />
    </div>
  );
}

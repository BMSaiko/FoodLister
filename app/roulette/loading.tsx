import ToviLoader from "@/components/loading/ToviLoader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ToviLoader size="md" rotateMessages />
    </div>
  );
}

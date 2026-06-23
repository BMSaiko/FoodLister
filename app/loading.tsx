import PageLoader from "@/components/loading/PageLoader";

export default function Loading() {
  return (
    <PageLoader
      variant="spinner"
      size="md"
      text="A carregar..."
    />
  );
}

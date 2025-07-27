import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-5">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      <p className="text-lg text-muted-foreground">Loading dashboard...</p>
    </div>
  );
}

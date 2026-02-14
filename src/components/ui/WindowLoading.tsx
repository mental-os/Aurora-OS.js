import { Loader2 } from "lucide-react";

export function WindowLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading Application...</span>
    </div>
  );
}

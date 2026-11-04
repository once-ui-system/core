import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Invited: "bg-sky-500",
  Suspended: "bg-red-500",
  Archived: "bg-zinc-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", tone[status] ?? "bg-zinc-400")}
      />
      {status}
    </Badge>
  );
}

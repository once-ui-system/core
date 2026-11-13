import { Badge } from "@/components/ui/badge";
import type { Rsvp } from "@/lib/data";
import { RSVP_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

const STYLE: Record<Rsvp, string> = {
  yes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  maybe: "border-amber-300 bg-amber-50 text-amber-900",
  pending: "border-border bg-secondary text-muted-foreground",
  no: "border-red-300 bg-red-50 text-red-900",
};

export function RsvpBadge({ rsvp, className }: { rsvp: Rsvp; className?: string }) {
  return (
    <Badge variant="outline" className={cn(STYLE[rsvp], className)}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

export function DietBadge({ diet, className }: { diet: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-amber-300 bg-amber-50 text-amber-900", className)}>
      {diet}
    </Badge>
  );
}

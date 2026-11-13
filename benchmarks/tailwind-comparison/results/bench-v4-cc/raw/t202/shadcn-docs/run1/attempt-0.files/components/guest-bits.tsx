import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RSVP_LABEL, dietTone, initials, partyStyle, rsvpTone, type Guest, type Rsvp } from "@/lib/data";

export function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={partyStyle(guest.party)}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
        className,
      )}
    >
      {initials(guest.name)}
    </span>
  );
}

export function DietBadge({ diet, className }: { diet: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", dietTone(diet), className)}>
      {diet}
    </Badge>
  );
}

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge variant="outline" className={cn("font-normal", rsvpTone(rsvp))}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

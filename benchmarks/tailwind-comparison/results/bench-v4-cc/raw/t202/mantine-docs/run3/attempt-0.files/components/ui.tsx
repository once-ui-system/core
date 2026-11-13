import { Badge, Box } from "@mantine/core";
import type { Rsvp } from "@/lib/data";
import { partyColor } from "@/lib/plan";

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null;
  return (
    <Badge color="orange" variant="light" size="sm" radius="sm" style={{ textTransform: "none" }}>
      {diet}
    </Badge>
  );
}

const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};
const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge color={RSVP_COLOR[rsvp]} variant="light" size="sm" style={{ textTransform: "none" }}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

export function PartyDot({ party }: { party: string }) {
  const c = partyColor(party);
  return (
    <Box
      component="span"
      aria-hidden
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        flex: "none",
        background: `var(--mantine-color-${c}-3)`,
        border: `1.5px solid var(--mantine-color-${c}-7)`,
      }}
    />
  );
}

import { Badge, ColorSwatch, Group, Text } from "@mantine/core";
import { IconAlertTriangle, IconLeaf, IconToolsKitchen2 } from "@tabler/icons-react";
import { PARTY_COLOR, RSVP_COLOR, RSVP_LABEL, type Rsvp } from "@/lib/data";

export function ink(color: string) {
  return { color: `light-dark(var(--mantine-color-${color}-9), var(--mantine-color-${color}-1))` };
}

export function partyColor(party: string): string {
  return PARTY_COLOR[party] ?? "gray";
}

export function PartyDot({ party, size = 10 }: { party: string; size?: number }) {
  return <ColorSwatch color={`var(--mantine-color-${partyColor(party)}-filled)`} size={size} withShadow={false} />;
}

export function PartyBadge({ party }: { party: string }) {
  return (
    <Badge variant="light" color={partyColor(party)} size="sm" tt="none" fw={600} style={ink(partyColor(party))}>
      {party}
    </Badge>
  );
}

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge variant={rsvp === "yes" ? "light" : "outline"} color={RSVP_COLOR[rsvp]} size="sm" tt="none" style={ink(rsvp === "pending" ? "gray" : RSVP_COLOR[rsvp])}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

const ALLERGY = /allerg/i;

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null;
  const allergy = ALLERGY.test(diet);
  return (
    <Badge
      variant={allergy ? "filled" : "light"}
      color={allergy ? "red" : "grape"}
      size="sm"
      tt="none"
      style={allergy ? undefined : ink("grape")}
      leftSection={allergy ? <IconAlertTriangle size={12} /> : <IconLeaf size={12} />}
    >
      {diet}
    </Badge>
  );
}

export function MealLabel({ meal, standard }: { meal: string; standard: boolean }) {
  return (
    <Group gap={6} wrap="nowrap">
      {standard ? <IconToolsKitchen2 size={15} /> : ALLERGY.test(meal) ? <IconAlertTriangle size={15} color="var(--mantine-color-red-6)" /> : <IconLeaf size={15} />}
      <Text size="sm" fw={standard ? 500 : 600}>
        {meal}
      </Text>
    </Group>
  );
}

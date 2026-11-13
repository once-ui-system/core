import { Badge, Box, Flex, VisuallyHidden } from "@chakra-ui/react";
import type { Status } from "@/lib/data";

export function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/** Medical alerts as solid red pills: used everywhere a patient appears. */
export function AlertPills({ alerts, large = false }: { alerts: string[]; large?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <Flex as="ul" aria-label="Medical alerts" listStyleType="none" m="0" p="0" gap="1.5" wrap="wrap">
      {alerts.map((alert) => (
        <Flex
          as="li"
          key={alert}
          align="center"
          gap={large ? "2" : "1.5"}
          bg="red.solid"
          color="red.contrast"
          fontWeight="semibold"
          fontSize={large ? "md" : "sm"}
          lineHeight="short"
          px={large ? "3.5" : "2.5"}
          py={large ? "2" : "1"}
          rounded="md"
        >
          <AlertIcon size={large ? 20 : 15} />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          <Box as="span">{alert}</Box>
        </Flex>
      ))}
    </Flex>
  );
}

const STATUS_META: Record<Status, { label: string; palette: string }> = {
  booked: { label: "Booked", palette: "gray" },
  checked_in: { label: "Checked in", palette: "blue" },
  in_exam: { label: "In exam", palette: "purple" },
  done: { label: "Done", palette: "green" },
  cancelled: { label: "Cancelled", palette: "gray" },
};

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <Badge colorPalette={meta.palette} variant={status === "in_exam" ? "solid" : "subtle"} size="md">
      {meta.label}
    </Badge>
  );
}

"use client";

import { Column, Row, Text, ToggleButton } from "@once-ui-system/core";

const nav = [
  { label: "Overview", href: "#" },
  { label: "Analytics", href: "#" },
  { label: "Orders", href: "#" },
  { label: "Customers", href: "#" },
  { label: "Settings", href: "#" },
];

/** App sidebar shell — compose with Header1 + Table1 in Dashboard1 */
export const Sidebar1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => (
  <Column
    fillHeight
    maxWidth={18}
    background="surface"
    borderRight="neutral-alpha-weak"
    padding="8"
    gap="4"
    {...flex}
  >
    <Text variant="label-default-s" onBackground="neutral-weak" padding="12">
      Dashboard
    </Text>
    {nav.map((item) => (
      <ToggleButton key={item.label} fillWidth horizontal="start">
        {item.label}
      </ToggleButton>
    ))}
    <Row flex={1} />
  </Column>
);

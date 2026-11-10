"use client";

import { Column, Row, Select, Text } from "@once-ui-system/core";
import { useState } from "react";

/**
 * Select `position="aligned"` check page.
 *
 * Expected behavior:
 * 1. Short list: opens with the selected option exactly over the field, the
 *    others above and below it in their own order.
 * 2. Long list: cut to the room on each side and scrolled, the selected
 *    option still over the field.
 * 3. No selection: the first option sits over the field.
 * 4. Near the top or bottom of the viewport: opens as a normal dropdown.
 * 5. Searchable: opens as a normal dropdown.
 */
const SIZES = ["XS", "S", "M", "L", "XL"].map((v) => ({ label: v, value: v }));
const ZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Budapest",
  "Europe/Athens",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Kiritimati",
].map((v) => ({ label: v.replace("_", " "), value: v }));

export default function SelectAlignedCheck() {
  const [size, setSize] = useState("L");
  const [zone, setZone] = useState("Asia/Tokyo");
  const [empty, setEmpty] = useState("");
  const [edge, setEdge] = useState("XL");
  const [search, setSearch] = useState("M");

  return (
    <Column fillWidth horizontal="center" paddingX="16">
      <Row fillWidth maxWidth={40} paddingTop="8">
        <Select
          id="aligned-edge-top"
          label="Near the top"
          position="aligned"
          options={SIZES}
          value={edge}
          onSelect={(v) => setEdge(v as string)}
        />
      </Row>
      <Column fillWidth maxWidth={40} gap="32" paddingY="160">
        <Text variant="heading-strong-l">Select position="aligned"</Text>
        <Select
          id="aligned-short"
          label="Size"
          position="aligned"
          options={SIZES}
          value={size}
          onSelect={(v) => setSize(v as string)}
        />
        <Select
          id="aligned-long"
          label="Time zone"
          position="aligned"
          options={ZONES}
          value={zone}
          onSelect={(v) => setZone(v as string)}
        />
        <Select
          id="aligned-empty"
          label="Nothing picked"
          position="aligned"
          options={SIZES}
          value={empty}
          onSelect={(v) => setEmpty(v as string)}
        />
        <Select
          id="aligned-search"
          label="Searchable (dropdown)"
          position="aligned"
          searchable
          options={SIZES}
          value={search}
          onSelect={(v) => setSearch(v as string)}
        />
        <Select
          id="dropdown-default"
          label="Default dropdown"
          options={SIZES}
          value={size}
          onSelect={(v) => setSize(v as string)}
        />
      </Column>
    </Column>
  );
}

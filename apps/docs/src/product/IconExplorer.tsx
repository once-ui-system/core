"use client";

import {
  Button,
  Column,
  Grid,
  Icon,
  type IconName,
  Input,
  iconLibrary,
  Row,
  SegmentedControl,
  Text,
  ToggleButton,
  useToast,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

const names = Object.keys(iconLibrary).sort((a, b) => a.localeCompare(b)) as IconName[];

type Size = "s" | "m" | "l" | "xl";
type Corners = "rounded" | "conservative";
type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger";

const SIZES: { label: string; value: Size }[] = [
  { label: "S", value: "s" },
  { label: "M", value: "m" },
  { label: "L", value: "l" },
  { label: "XL", value: "xl" },
];
const CORNERS: { label: string; value: Corners }[] = [
  { label: "Round", value: "rounded" },
  { label: "Square", value: "conservative" },
];
const TONES: { label: string; value: Tone }[] = [
  { label: "Neutral", value: "neutral" },
  { label: "Brand", value: "brand" },
  { label: "Accent", value: "accent" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Danger", value: "danger" },
];

/**
 * The whole icon set on its own page: search it, try it at each size, in each
 * colour and with round or square caps (the `data-border` theme setting),
 * then copy a name or the JSX for the icon you picked.
 */
export function IconExplorer() {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<Size>("m");
  const [corners, setCorners] = useState<Corners>("rounded");
  const [tone, setTone] = useState<Tone>("neutral");
  const [picked, setPicked] = useState<IconName>("sparkle");
  const { addToast } = useToast();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? names.filter((name) => name.toLowerCase().includes(q)) : names;
  }, [query]);

  const color = `${tone}-${tone === "neutral" ? "strong" : "medium"}` as const;
  const jsx = `<Icon name="${picked}"${size === "m" ? "" : ` size="${size}"`}${tone === "neutral" ? "" : ` onBackground="${color}"`} />`;

  const copy = (text: string, what: string) => {
    navigator.clipboard?.writeText(text).then(
      () => addToast({ tone: "success", message: `Copied ${what}` }),
      () => addToast({ tone: "danger", message: "Couldn't copy to the clipboard" }),
    );
  };

  return (
    <Column fillWidth gap="16" marginTop="16" marginBottom="24" data-border={corners}>
      <Row
        fillWidth
        gap="24"
        padding="24"
        radius="l"
        border="neutral-alpha-weak"
        background="surface"
        vertical="center"
        s={{ direction: "column", vertical: "start" }}
      >
        <Row
          center
          radius="m"
          border="neutral-alpha-weak"
          background="page"
          minWidth="128"
          minHeight="128"
          aria-hidden="true"
        >
          <Icon name={picked} size="xl" onBackground={color} style={{ transform: "scale(2)" }} />
        </Row>
        <Column fillWidth gap="12">
          <Text variant="heading-strong-l">{picked}</Text>
          <Row gap="16" vertical="center" wrap>
            {(["xs", "s", "m", "l", "xl"] as const).map((s) => (
              <Icon key={s} name={picked} size={s} onBackground={color} />
            ))}
          </Row>
          <Text variant="code-default-s" onBackground="neutral-medium">
            {jsx}
          </Text>
          <Row gap="8" wrap>
            <Button
              size="s"
              variant="secondary"
              prefixIcon="copy"
              onClick={() => copy(picked, `"${picked}"`)}
            >
              Copy name
            </Button>
            <Button
              size="s"
              variant="secondary"
              prefixIcon="code"
              onClick={() => copy(jsx, "the JSX")}
            >
              Copy JSX
            </Button>
          </Row>
        </Column>
      </Row>

      <Input
        id="icon-explorer-search"
        label={`Search ${names.length} icons`}
        prefix={<Icon marginLeft="4" onBackground="neutral-weak" name="search" size="xs" />}
        value={query}
        onValueChange={setQuery}
      />
      <Grid fillWidth columns="2" s={{ columns: "1" }} gap="12">
        <SegmentedControl
          aria-label="Size"
          buttons={SIZES}
          value={size}
          onValueChange={(v) => setSize(v as Size)}
        />
        <SegmentedControl
          aria-label="Caps and joins"
          buttons={CORNERS}
          value={corners}
          onValueChange={(v) => setCorners(v as Corners)}
        />
      </Grid>
      <Row fillWidth>
        <SegmentedControl
          aria-label="Colour"
          buttons={TONES}
          value={tone}
          onValueChange={(v) => setTone(v as Tone)}
        />
      </Row>

      {shown.length === 0 ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          No icon matches “{query}”.
        </Text>
      ) : (
        <Grid fillWidth columns="6" m={{ columns: "4" }} s={{ columns: "3" }} gap="4">
          {shown.map((name) => (
            <ToggleButton
              key={name}
              fillWidth
              size="l"
              selected={name === picked}
              aria-label={`Show ${name}`}
              onClick={() => setPicked(name)}
              style={{ height: "auto" }}
            >
              <Column horizontal="center" gap="8" paddingY="16" fillWidth>
                <Icon name={name} size={size} onBackground={color} />
                <Text variant="code-default-xs" onBackground="neutral-weak" wrap="balance">
                  {name}
                </Text>
              </Column>
            </ToggleButton>
          ))}
        </Grid>
      )}
    </Column>
  );
}

"use client";

import {
  Column,
  Grid,
  Row,
  SegmentedControl,
  Setting,
  type StyleScopeConfig,
  Text,
} from "@once-ui-system/core";
import { useEditorContext } from "../context.js";
import type { SiteStyle } from "../model.js";

const SCHEMES = [
  "blue",
  "indigo",
  "violet",
  "magenta",
  "pink",
  "red",
  "orange",
  "yellow",
  "moss",
  "green",
  "emerald",
  "aqua",
  "cyan",
] as const;

const NEUTRALS = ["gray", "slate", "sand", "rose", "mint", "dusk"] as const;

/** A row of colour dots; the picked one has a ring. */
function SwatchPicker({
  label,
  values,
  value,
  onValueChange,
}: {
  label: string;
  values: readonly string[];
  value?: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Column fillWidth gap="8" role="radiogroup" aria-label={label}>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Grid fillWidth columns="7" gap="8">
        {values.map((scheme) => {
          const selected = scheme === value;
          return (
            <Row
              key={scheme}
              as="button"
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={scheme}
              title={scheme}
              aspectRatio="1"
              radius="full"
              padding="2"
              cursor="interactive"
              background="transparent"
              border={selected ? "neutral-strong" : "transparent"}
              onClick={() => onValueChange(scheme)}
            >
              <Row fill radius="full" style={{ background: `var(--scheme-${scheme}-600)` }} />
            </Row>
          );
        })}
      </Grid>
    </Column>
  );
}

/**
 * The site's look: colours, theme and corners. Every change applies to the
 * preview at once and undoes like any other.
 */
export function DesignPanel({
  style,
  onChange,
}: {
  style: SiteStyle;
  onChange: (config: Partial<StyleScopeConfig>, key: string) => void;
}) {
  const { labels } = useEditorContext();
  const config = style.config;
  return (
    <Column fillWidth gap="24" paddingY="16">
      <SwatchPicker
        label={labels.brand}
        values={SCHEMES}
        value={config.brand}
        onValueChange={(brand) => onChange({ brand: brand as StyleScopeConfig["brand"] }, "brand")}
      />
      <SwatchPicker
        label={labels.accent}
        values={SCHEMES}
        value={config.accent}
        onValueChange={(accent) =>
          onChange({ accent: accent as StyleScopeConfig["accent"] }, "accent")
        }
      />
      <SwatchPicker
        label={labels.neutral}
        values={NEUTRALS}
        value={config.neutral}
        onValueChange={(neutral) =>
          onChange({ neutral: neutral as StyleScopeConfig["neutral"] }, "neutral")
        }
      />
      <Setting label={labels.theme}>
        <SegmentedControl
          fillWidth
          value={config.theme ?? "light"}
          onValueChange={(theme) =>
            onChange({ theme: theme as StyleScopeConfig["theme"] }, "theme")
          }
          buttons={[
            { value: "light", label: labels.themeLight },
            { value: "dark", label: labels.themeDark },
            { value: "system", label: labels.themeSystem },
          ]}
        />
      </Setting>
      <Setting label={labels.border}>
        <SegmentedControl
          fillWidth
          value={config.border ?? "rounded"}
          onValueChange={(border) =>
            onChange({ border: border as StyleScopeConfig["border"] }, "border")
          }
          buttons={[
            { value: "rounded", label: labels.borderRounded },
            { value: "playful", label: labels.borderPlayful },
            { value: "conservative", label: labels.borderConservative },
          ]}
        />
      </Setting>
    </Column>
  );
}

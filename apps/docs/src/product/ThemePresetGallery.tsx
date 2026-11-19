"use client";

import {
  Button,
  Column,
  Grid,
  Heading,
  Row,
  StyleScope,
  type StyleScopeConfig,
  Tag,
  Text,
} from "@once-ui-system/core";
import { type ThemePresetName, themePresets } from "@once-ui-system/core/config";

const SAMPLE: Record<
  ThemePresetName,
  { app: string; title: string; stats: [string, string][]; item: string; status: string }
> = {
  ops: {
    app: "Halden Dispatch",
    title: "North sector",
    stats: [
      ["Open", "14"],
      ["En route", "6"],
    ],
    item: "Unit 12 · Medical",
    status: "En route",
  },
  care: {
    app: "Fjell Plants",
    title: "Good morning",
    stats: [
      ["Plants", "9"],
      ["Thirsty", "2"],
    ],
    item: "Monty · Monstera",
    status: "Water today",
  },
  creative: {
    app: "Ember Studio",
    title: "Spring cut",
    stats: [
      ["Clips", "38"],
      ["Length", "2:14"],
    ],
    item: "Intro · Track 2",
    status: "Rendering",
  },
  commerce: {
    app: "Fjell Goods",
    title: "Your order",
    stats: [
      ["Items", "3"],
      ["Total", "€86"],
    ],
    item: "Linen apron, sand",
    status: "In stock",
  },
};

// Each preview follows the page's theme: switch the docs theme to see both.
// (Pinning a scope to the other theme leaves Tag and contrast solids on the
// page's theme, a StyleScope gap tracked separately.)
function scopeConfig(name: ThemePresetName): StyleScopeConfig {
  const { theme: _theme, defaultTheme: _defaultTheme, ...style } = themePresets[name].style;
  return style as StyleScopeConfig;
}

/** The four theme presets side by side, in the page's theme. */
export function ThemePresetGallery() {
  return (
    <Grid columns="2" s={{ columns: "1" }} gap="16" fillWidth marginBottom="24">
      {(Object.keys(themePresets) as ThemePresetName[]).map((name) => {
        const sample = SAMPLE[name];
        return (
          <StyleScope
            key={name}
            config={scopeConfig(name)}
            direction="column"
            background="page"
            border="neutral-alpha-weak"
            radius="l"
            padding="16"
            gap="12"
          >
            <Row horizontal="between" vertical="center">
              <Text variant="label-strong-s" onBackground="neutral-strong">
                {sample.app}
              </Text>
              <Tag size="s" tone="neutral" label={name} />
            </Row>
            <Column
              background="surface"
              border="neutral-alpha-weak"
              radius="m"
              padding="16"
              gap="12"
            >
              <Heading as="h3" variant="heading-strong-m">
                {sample.title}
              </Heading>
              <Row gap="16">
                {sample.stats.map(([label, value]) => (
                  <Column key={label} gap="2">
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {label}
                    </Text>
                    <Text variant="heading-strong-s" onBackground="neutral-strong">
                      {value}
                    </Text>
                  </Column>
                ))}
              </Row>
              <Row
                horizontal="between"
                vertical="center"
                padding="12"
                radius="m"
                background="brand-alpha-weak"
                border="brand-alpha-medium"
                gap="8"
              >
                <Text variant="label-default-s" onBackground="brand-strong">
                  {sample.item}
                </Text>
                <Tag size="s" tone="accent" label={sample.status} />
              </Row>
              <Row gap="8">
                <Button size="s" label="Continue" />
                <Button size="s" variant="secondary" label="Later" />
              </Row>
            </Column>
          </StyleScope>
        );
      })}
    </Grid>
  );
}

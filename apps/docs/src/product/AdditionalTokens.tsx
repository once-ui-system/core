"use client";

import React from "react";
import { Grid, Flex, HeadingLink } from "@once-ui-system/core";
import { PropsTable } from "./PropsTable";

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
}

const AMBIENT_SWATCHES = [
  { label: "page-background", token: "page-background" },
  { label: "backdrop", token: "backdrop" },
  { label: "surface-background", token: "surface-background" },
  { label: "surface-border", token: "surface-border", isBorder: true },
  { label: "default-border", token: "default-border", isBorder: true },
];

const CODE_TOKENS = [
  "moss", "gray", "aqua", "green", "blue", "violet", "orange",
];

const DATA_TOKENS = [
  "blue", "aqua", "magenta", "pink", "yellow", "orange", "red",
  "moss", "green", "emerald", "cyan", "violet", "indigo", "gray",
];

const STATIC_TOKENS = [
  { label: "transparent", token: "static-transparent" },
  { label: "white", token: "static-white" },
  { label: "white-medium", token: "static-white-medium" },
  { label: "black", token: "static-black" },
  { label: "black-medium", token: "static-black-medium" },
];

function CodeTokens() {
  return (
    <>
      <HeadingLink marginTop="24" marginBottom="12" as="h3" id={slugify("Code syntax tokens")}>
        Code syntax tokens
      </HeadingLink>
      <Grid marginBottom="16" gap="1" columns="7" s={{ columns: 3 }} radius="l" overflow="hidden">
        {CODE_TOKENS.map((name) => (
          <Flex
            key={name}
            padding="16"
            horizontal="center"
            align="center"
            textVariant="label-default-s"
            style={{
              backgroundColor: `color-mix(in srgb, var(--code-${name}) 20%, transparent)`,
              color: `var(--code-${name})`,
            }}
          >
            {name}
          </Flex>
        ))}
      </Grid>
      <PropsTable
        content={[
          ["code-moss", "CSS color"],
          ["code-gray", "CSS color"],
          ["code-aqua", "CSS color"],
          ["code-green", "CSS color"],
          ["code-blue", "CSS color"],
          ["code-violet", "CSS color"],
          ["code-orange", "CSS color"],
        ]}
      />
    </>
  );
}

function DataTokens() {
  return (
    <>
      <HeadingLink marginTop="24" marginBottom="12" as="h3" id={slugify("Data visualization tokens")}>
        Data visualization tokens
      </HeadingLink>
      <Grid marginBottom="16" gap="1" columns="7" s={{ columns: 3 }} radius="l" overflow="hidden">
        {DATA_TOKENS.map((name) => (
          <Flex
            key={name}
            padding="16"
            horizontal="center"
            align="center"
            textVariant="label-default-xs"
            onSolid="neutral-strong"
            style={{ backgroundColor: `var(--data-${name})` }}
          >
            {name}
          </Flex>
        ))}
      </Grid>
      <PropsTable
        content={[
          ["data-blue", "CSS color"],
          ["data-aqua", "CSS color"],
          ["data-magenta", "CSS color"],
          ["data-pink", "CSS color"],
          ["data-yellow", "CSS color"],
          ["data-orange", "CSS color"],
          ["data-red", "CSS color"],
          ["data-moss", "CSS color"],
          ["data-green", "CSS color"],
          ["data-emerald", "CSS color"],
          ["data-cyan", "CSS color"],
          ["data-violet", "CSS color"],
          ["data-indigo", "CSS color"],
          ["data-gray", "CSS color"],
        ]}
      />
    </>
  );
}

function StaticTokens() {
  return (
    <>
      <HeadingLink marginTop="24" marginBottom="12" as="h3" id={slugify("Static tokens")}>
        Static tokens
      </HeadingLink>
      <Grid marginBottom="16" gap="1" columns="5" s={{ columns: 2 }} radius="l" overflow="hidden">
        {STATIC_TOKENS.map((item) => (
          <Flex
            key={item.label}
            padding="16"
            horizontal="center"
            align="center"
            textVariant="label-default-xs"
            style={{
              backgroundColor: `var(--${item.token})`,
              color: item.token === "static-transparent"
                ? "var(--neutral-on-background-strong)"
                : item.token.includes("white")
                  ? "var(--static-black)"
                  : "var(--static-white)",
            
            }}
          >
            {item.label}
          </Flex>
        ))}
      </Grid>
      <PropsTable
        content={[
          ["static-transparent", "CSS color", "#00000000"],
          ["static-white", "CSS color", "#ffffff"],
          ["static-white-medium", "CSS color", "#ffffff4D"],
          ["static-black", "CSS color", "#000000"],
          ["static-black-medium", "CSS color", "#0000004D"],
        ]}
      />
    </>
  );
}

function AdditionalTokens() {
  return (
    <>
      <CodeTokens />
      <DataTokens />
      <StaticTokens />
    </>
  );
}

export { AdditionalTokens };

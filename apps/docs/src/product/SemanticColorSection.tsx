"use client";

import React from "react";
import { Column, Flex, HeadingLink } from "@once-ui-system/core";
import { PropsTable } from "./PropsTable";

const TOKEN_ROWS: { label: string; bg: string; color: string; border?: string }[][] = [
  [
    { label: "background-strong", bg: "background-strong", color: "on-background-strong" },
    { label: "background-medium", bg: "background-medium", color: "on-background-medium" },
    { label: "background-weak", bg: "background-weak", color: "on-background-weak" },
  ],
  [
    { label: "on-background-strong", bg: "background-weak", color: "on-background-strong" },
    { label: "on-background-medium", bg: "background-weak", color: "on-background-medium" },
    { label: "on-background-weak", bg: "background-weak", color: "on-background-weak" },
  ],
  [
    { label: "solid-strong", bg: "solid-strong", color: "on-solid-strong" },
    { label: "solid-medium", bg: "solid-medium", color: "on-solid-strong" },
    { label: "solid-weak", bg: "solid-weak", color: "on-solid-strong" },
  ],
  [
    { label: "on-solid-strong", bg: "solid-strong", color: "on-solid-strong" },
    { label: "on-solid-medium", bg: "solid-strong", color: "on-solid-medium" },
    { label: "on-solid-weak", bg: "solid-strong", color: "on-solid-weak" },
  ],
  [
    { label: "border-strong", bg: "background-weak", color: "on-background-strong", border: "border-strong" },
    { label: "border-medium", bg: "background-weak", color: "on-background-medium", border: "border-medium" },
    { label: "border-weak", bg: "background-weak", color: "on-background-weak", border: "border-weak" },
  ],
  [
    { label: "alpha-strong", bg: "alpha-strong", color: "on-background-strong" },
    { label: "alpha-medium", bg: "alpha-medium", color: "on-background-strong" },
    { label: "alpha-weak", bg: "alpha-weak", color: "on-background-strong" },
  ],
];

export const SEMANTIC_SECTIONS = [
  { number: 1, name: "Neutral", prefix: "neutral" },
  { number: 2, name: "Brand", prefix: "brand" },
  { number: 3, name: "Accent", prefix: "accent" },
  { number: 4, name: "Info", prefix: "info" }, 
  { number: 5, name: "Danger", prefix: "danger" },
  { number: 6, name: "Warning", prefix: "warning" },
  { number: 7, name: "Success", prefix: "success" },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
}

function SemanticColorSection({ number, name, prefix }: { number: number; name: string; prefix: string }) {
  const headingId = slugify(`${number}. ${name}`);

  return (
    <>
      <HeadingLink marginTop="24" marginBottom="12" as="h3" id={headingId}>
        {number}. {name}
      </HeadingLink>

      <Column fillWidth gap="1" radius="l" overflow="hidden">
        {TOKEN_ROWS.map((row, i) => (
          <Flex key={i} fillWidth gap="1">
            {row.map((item) => (
              <Flex
                fillWidth
                padding="16"
                horizontal="center"
                align="center"
                textVariant="label-default-xs"
                key={item.label}
                style={{
                  backgroundColor: `var(--${prefix}-${item.bg})`,
                  color: `var(--${prefix}-${item.color})`,
                  ...(item.border ? { border: `2px solid var(--${prefix}-${item.border})` } : {}),
                }}
              >
                {item.label}
              </Flex>
            ))}
          </Flex>
        ))}
      </Column>

      <PropsTable
        content={[
          [`${prefix}-background`, ["strong", "medium", "weak"]],
          [`${prefix}-on-background`, ["strong", "medium", "weak"]],
          [`${prefix}-solid`, ["strong", "medium", "weak"]],
          [`${prefix}-on-solid`, ["strong", "medium", "weak"]],
          [`${prefix}-border`, ["strong", "medium", "weak"]],
          [`${prefix}-alpha`, ["strong", "medium", "weak"]],
        ]}
      />
    </>
  );
}

function SemanticColorSections() {
  return (
    <>
      {SEMANTIC_SECTIONS.map((s) => (
        <SemanticColorSection key={s.prefix} number={s.number} name={s.name} prefix={s.prefix} />
      ))}
    </>
  );
}

export { SemanticColorSection, SemanticColorSections };

"use client";

import React from "react";
import { Flex } from "@once-ui-system/core";
import { PropsTable } from "./PropsTable";

const SCHEMES = [
  "Sand", "Gray", "Slate", "Mint", "Rose", "Dusk",
  "Red", "Orange", "Yellow",
  "Moss", "Green", "Emerald",
  "Aqua", "Cyan", "Blue",
  "Indigo", "Violet", "Magenta", "Pink",
];

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];

function ColorSchemeGrid() {
  return (
    <>
      <Flex fillWidth marginBottom="16" style={{ overflowX: "auto" }}>
        <Flex style={{ flexDirection: "column", gap: "var(--static-space-1)", minWidth: "680px" }}>
          <Flex gap="1" style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <Flex
              paddingX="8"
              paddingY="12"
              horizontal="center"
              align="center"
              style={{ width: "72px", flexShrink: 0 }}
              textVariant="label-default-xs"
              onBackground="neutral-medium"
            />
            {WEIGHTS.map((w) => (
              <Flex
                key={w}
                fillWidth
                paddingY="12"
                horizontal="center"
                align="center"
                textVariant="label-default-xs"
                onBackground="neutral-medium"
              >
                {w}
              </Flex>
            ))}
          </Flex>
          {SCHEMES.map((scheme) => (
            <Flex key={scheme} gap="1">
              <Flex
                paddingX="8"
                paddingY="12"
                horizontal="center"
                align="center"
                radius="s"
                style={{ width: "72px", flexShrink: 0, textTransform: "capitalize" }}
                textVariant="label-default-xs"
                onBackground="neutral-medium"
              >
                {scheme}
              </Flex>
              {WEIGHTS.map((weight) => (
                <Flex
                  key={weight}
                  fillWidth
                  radius="s"
                  title={`${scheme}-${weight}`}
                  style={{
                    backgroundColor: `var(--scheme-${scheme.toLowerCase()}-${weight})`,
                    aspectRatio: "1",
                    minHeight: "28px",
                  }}
                />
              ))}
            </Flex>
          ))}
        </Flex>
      </Flex>

      <PropsTable
        content={SCHEMES.map((s) => [
          `scheme-${s.toLowerCase()}-{weight}`,
          "CSS color",
          "100 - 1200",
        ])}
      />
    </>
  );
}

export { ColorSchemeGrid };

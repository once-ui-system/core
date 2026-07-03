"use client";

import React from "react";
import { Column, Flex, Row } from "@once-ui-system/core";
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
      <Row fillWidth marginBottom="16" overflowX="auto">
        <Column fillWidth gap="1" minWidth={40} paddingY="8">
          <Row gap="1" position="sticky" background="page" zIndex={1}>
            <Flex
              paddingX="8"
              paddingY="12"
              horizontal="center"
              align="center"
              minWidth="80"
              textVariant="label-default-xs"
              onBackground="neutral-medium"
            />
            {WEIGHTS.map((w) => (
              <Flex
                key={w}
                fillWidth
                paddingY="12"
                horizontal="center"
                textVariant="label-default-xs"
                onBackground="neutral-medium"
              >
                {w}
              </Flex>
            ))}
          </Row>
          {SCHEMES.map((scheme) => (
            <Flex key={scheme} gap="1">
              <Flex
                paddingX="8"
                paddingY="12"
                radius="s"
                minWidth="80"
                vertical="center"
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
                  aspectRatio="1"
                  title={`${scheme}-${weight}`}
                  style={{
                    backgroundColor: `var(--scheme-${scheme.toLowerCase()}-${weight})`,
                  }}
                />
              ))}
            </Flex>
          ))}
        </Column>
      </Row>

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

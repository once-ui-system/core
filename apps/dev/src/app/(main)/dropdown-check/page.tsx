"use client";

import { Button, Column, DropdownWrapper, Option, Row, Text } from "@once-ui-system/core";

/**
 * DropdownWrapper check page — permanent regression fixture.
 *
 * Anchors the three sizing/placement cases that regressed across 1.8.x
 * (320px content floor, 200px fillWidth floor, panel not filling the
 * floating container). Intended target for the planned Playwright
 * visual-regression suite (see rfcs/2026-08-once-ui-2-architecture.md §5.6).
 *
 * Expected behavior:
 * 1. fillWidth: the visible panel exactly matches the trigger width.
 * 2. fillWidth + bottom-end in a scrollable panel: panel sits flush under
 *    the trigger, no overhang, tracks scroll while open.
 * 3. No fillWidth: panel stays content-sized.
 */
export default function DropdownCheck() {
  return (
    <Row fillWidth gap="24" padding="24" data-testid="root">
      {/* Case 1: org-switcher style — wide fillWidth trigger */}
      <Column width={30} gap="12" data-testid="case-fill">
        <Text variant="label-strong-s">Case 1: fillWidth (org switcher)</Text>
        <DropdownWrapper
          fillWidth
          trigger={
            <Button fillWidth variant="secondary" suffixIcon="chevronDown" data-testid="trigger-fill">
              Dopler
            </Button>
          }
          dropdown={
            <Column fillWidth padding="4" gap="2">
              <Option value="quasar" label="Quasar" />
              <Option value="dopler" label="Dopler" selected />
              <Option value="jx" label="JExcellence2" />
            </Column>
          }
        />
      </Column>

      {/* Case 2: Adjustable style — rows in a scrollable panel, bottom-end */}
      <Column
        width={32}
        height={24}
        overflowY="auto"
        border="neutral-alpha-medium"
        radius="l"
        padding="12"
        gap="8"
        data-testid="panel"
      >
        <Text variant="label-strong-s">Case 2: scrollable panel (Adjustable)</Text>
        {Array.from({ length: 10 }).map((_, i) => (
          <Row
            key={i}
            fillWidth
            padding="8"
            gap="12"
            vertical="center"
            horizontal="between"
            radius="l"
            border="neutral-alpha-weak"
          >
            <Column gap="2" paddingLeft="8">
              <Text variant="label-default-s">Row {i + 1}</Text>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                path-{i + 1}
              </Text>
            </Column>
            <Row horizontal="end" gap="8">
              <DropdownWrapper
                fillWidth
                placement="bottom-end"
                trigger={
                  <Button
                    size="s"
                    variant="secondary"
                    suffixIcon="chevronDown"
                    fillWidth
                    data-testid={`trigger-row-${i + 1}`}
                  >
                    Default
                  </Button>
                }
                dropdown={
                  <Column fillWidth padding="4" gap="2">
                    <Option value="default" label="Default" selected />
                    <Option value="blog" label="Blog" />
                  </Column>
                }
              />
            </Row>
          </Row>
        ))}
      </Column>

      {/* Case 3: content-sized (no fillWidth) — must stay content width */}
      <Column gap="12" data-testid="case-content">
        <Text variant="label-strong-s">Case 3: content-sized</Text>
        <DropdownWrapper
          trigger={
            <Button size="s" variant="secondary" suffixIcon="chevronDown" data-testid="trigger-content">
              Menu
            </Button>
          }
          dropdown={
            <Column padding="4" gap="2">
              <Option value="a" label="Settings" />
              <Option value="b" label="Log out" />
            </Column>
          }
        />
      </Column>
    </Row>
  );
}

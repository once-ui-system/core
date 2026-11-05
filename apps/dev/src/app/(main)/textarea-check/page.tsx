"use client";

import { Column, Input, Row, Text, Textarea } from "@once-ui-system/core";

/**
 * Textarea check page — regression fixture for the floating label.
 *
 * Each row puts an Input beside a Textarea of the same size. The empty-state
 * label, the floated label (placeholder or value) and the value itself should
 * sit at the same height in both, at every size. The last rows cover a
 * multi-line value and a fixed `lines` field, where the label stays anchored
 * to the top.
 */

const SIZES = ["xs", "s", "m", "l", "xl"] as const;

export default function TextareaCheck() {
  return (
    <Column fillWidth gap="24" padding="24" maxWidth="l" data-testid="root">
      <Text textVariant="heading-strong-l">Textarea label</Text>
      {SIZES.map((size) => (
        <Column key={size} gap="8" data-testid={`size-${size}`}>
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {size}
          </Text>
          <Row gap="8">
            <Input id={`in-empty-${size}`} size={size} label="First comment" />
            <Textarea id={`ta-empty-${size}`} size={size} label="First comment" />
          </Row>
          <Row gap="8">
            <Input
              id={`in-filled-${size}`}
              size={size}
              label="First comment"
              defaultValue="Looks good"
            />
            <Textarea
              id={`ta-filled-${size}`}
              size={size}
              label="First comment"
              defaultValue="Looks good"
            />
          </Row>
        </Column>
      ))}
      <Column gap="8" data-testid="multi">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          multi-line and fixed lines
        </Text>
        <Row gap="8">
          <Textarea
            id="ta-multi"
            label="First comment"
            defaultValue={"Line one\nLine two\nLine three"}
          />
          <Textarea id="ta-lines-empty" label="First comment" lines={3} />
          <Textarea
            id="ta-lines-filled"
            label="First comment"
            lines={3}
            defaultValue="Looks good"
          />
        </Row>
      </Column>
    </Column>
  );
}

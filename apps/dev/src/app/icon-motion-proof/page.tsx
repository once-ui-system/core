"use client";

import {
  Accordion,
  Button,
  Checkbox,
  Column,
  Heading,
  Icon,
  IconButton,
  NavIcon,
  Row,
  Select,
  StyleScope,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { useState } from "react";

const shapes = ["playful", "rounded", "conservative"] as const;

function Panel({ shape }: { shape: (typeof shapes)[number] }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const [box, setBox] = useState(false);
  const [saved, setSaved] = useState(0);
  const [plan, setPlan] = useState("pro");
  return (
    <StyleScope config={{ border: shape }}>
      <Column
        gap="16"
        padding="20"
        radius="l"
        border="neutral-alpha-weak"
        background="surface"
        fillWidth
        data-shape-panel={shape}
      >
        <Text variant="label-strong-s" onBackground="neutral-weak">
          {shape}
        </Text>
        <Row gap="8" wrap>
          <Button variant="secondary" size="s" prefixIcon="bell" data-demo="bell">
            Notifications
          </Button>
          <Button variant="secondary" size="s" prefixIcon="trash" data-demo="trash">
            Delete
          </Button>
          <Button variant="secondary" size="s" prefixIcon="refresh" data-demo="refresh">
            Refresh
          </Button>
          <Button variant="secondary" size="s" prefixIcon="eye" data-demo="eye">
            Show
          </Button>
          <Button variant="secondary" size="s" suffixIcon="arrowRight" data-demo="arrow">
            Continue
          </Button>
          <Button size="s" arrowIcon data-demo="get-started">
            Get started
          </Button>
        </Row>
        <Row gap="8" vertical="center" wrap>
          <ToggleButton
            prefixIcon="heart"
            selected={liked}
            onClick={() => setLiked(!liked)}
            data-demo="heart"
          >
            Favourite
          </ToggleButton>
          <ToggleButton
            prefixIcon="plus"
            selected={adding}
            onClick={() => setAdding(!adding)}
            data-demo="plus"
          >
            Add
          </ToggleButton>
          <Button
            variant="tertiary"
            size="s"
            onClick={() => setBox(!box)}
            data-demo="checkbox-icon"
          >
            <Row gap="8" vertical="center">
              <Icon name="checkbox" active={box} size="s" />
              Agree
            </Row>
          </Button>
          <Button variant="tertiary" size="s" onClick={() => setSaved(saved + 1)} data-demo="check">
            <Row gap="8" vertical="center">
              {saved > 0 && <Icon key={saved} name="check" animate size="s" />}
              Save
            </Row>
          </Button>
          <NavIcon active={open} onClick={() => setOpen(!open)} data-demo="nav" />
        </Row>
        <Checkbox label="Email me updates" data-demo="checkbox" />
        <Accordion title="Shipping" data-demo="accordion">
          <Text>Ships in two days.</Text>
        </Accordion>
        <Accordion title="Returns" icon="plus" data-demo="accordion-plus">
          <Text>Thirty days, no questions.</Text>
        </Accordion>
        <Select
          id={`plan-${shape}`}
          label="Plan"
          value={plan}
          onValueChange={(v) => setPlan(v as string)}
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ]}
          data-demo="select"
        />
        <Row gap="8">
          <IconButton icon="trash" variant="secondary" tooltip="Delete" data-demo="icon-trash" />
          <IconButton icon="bell" variant="secondary" tooltip="Alerts" data-demo="icon-bell" />
        </Row>
      </Column>
    </StyleScope>
  );
}

export default function IconMotionProof() {
  return (
    <Column fillWidth padding="32" gap="24" horizontal="center">
      <Column maxWidth="xl" gap="8" fillWidth>
        <Heading variant="heading-strong-l">Icon motion</Heading>
        <Text onBackground="neutral-weak">
          Built-in icons that move, in the components that use them, in each border shape.
        </Text>
      </Column>
      <Row maxWidth="xl" gap="16" fillWidth s={{ direction: "column" }}>
        {shapes.map((shape) => (
          <Panel key={shape} shape={shape} />
        ))}
      </Row>
    </Column>
  );
}

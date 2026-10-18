"use client";

import { Tag, type IconName, Row, useToast } from "@once-ui-system/core";
import React, { useState } from "react";

export function BasicChipExample() {
  return (
    <Row gap="16" center>
      <Tag label="Default" selected />
      <Tag selected label="With icon" prefixIcon="calendar" />
      <Tag selected label="Removable" onRemove={() => {}} />
      <Tag selected={false} label="Unselected" />
    </Row>
  );
}

export function InteractiveChipExample() {
  const [selected, setSelected] = useState<boolean>(true);

  return <Tag label="Clickable" selected={selected} onClick={() => setSelected(!selected)} />;
}

export function ChipWithIconsExample() {
  return (
    <Row gap="16" center>
      <Tag selected label="Date" prefixIcon="calendar" />
      <Tag selected label="Discord" prefixIcon="discord" />
      <Tag selected label="Style" prefixIcon="style" />
      <Tag selected label="Favorite" prefixIcon="like" />
    </Row>
  );
}

export function RemovableChipsExample() {
  const { addToast } = useToast();
  const [chips, setChips] = useState<Array<{ id: string; label: string; icon?: IconName }>>([
    { id: "1", label: "React", icon: "code" },
    { id: "2", label: "TypeScript", icon: "code" },
    { id: "3", label: "Next.js" },
  ]);

  const handleRemove = (id: string) => {
    const chipToRemove = chips.find((chip) => chip.id === id);
    setChips(chips.filter((chip) => chip.id !== id));

    if (chipToRemove) {
      addToast({
        tone: "danger",
        message: `Removed ${chipToRemove.label} chip`,
      });
    }
  };

  return (
    <Row gap="8" wrap>
      {chips.map((chip) => (
        <Tag selected
          key={chip.id}
          label={chip.label}
          prefixIcon={chip.icon}
          onRemove={() => handleRemove(chip.id)}
        />
      ))}
    </Row>
  );
}

export function CustomRemovableChipExample() {
  const { addToast } = useToast();

  const handleRemove = (label: string) => {
    addToast({
      tone: "danger",
      message: `Removed ${label} chip`,
    });
  };

  return (
    <Row gap="16" horizontal="center">
      <Tag selected label="Removable" onRemove={() => handleRemove("Removable")} />
      <Tag selected label="With Icon" prefixIcon="tag" onRemove={() => handleRemove("With Icon")} />
      <Tag selected
        label="Custom Remove"
        onRemove={() => handleRemove("Custom Remove")}
        removeButtonProps={{
          icon: "trash",
          tooltip: "Delete",
        }}
      />
    </Row>
  );
}

"use client";

import React, { useState } from "react";
import { Chip, Row, useToast } from "@once-ui-system/core";

export function BasicChipExample() {
  return (
    <Row gap="16" center>
      <Chip label="Default" selected />
      <Chip label="With icon" prefixIcon="calendar" />
      <Chip label="Removable" onRemove={() => {}} />
      <Chip label="Unselected" />
    </Row>
  );
}

export function InteractiveChipExample() {
  const [selected, setSelected] = useState<boolean>(true);

  return (
    <Chip 
      label="Clickable" 
      selected={selected}
      onClick={() => setSelected(!selected)} 
    />
  );
}

export function ChipWithIconsExample() {
  return (
    <Row gap="16" center>
      <Chip label="Date" prefixIcon="calendar" />
      <Chip label="Discord" prefixIcon="discord" />
      <Chip label="Style" prefixIcon="style" />
      <Chip label="Favorite" prefixIcon="like" />
    </Row>
  );
}

export function RemovableChipsExample() {
  const { addToast } = useToast();
  const [chips, setChips] = useState<Array<{id: string, label: string, icon?: string}>>([
    { id: "1", label: "React", icon: "code" },
    { id: "2", label: "TypeScript", icon: "code" },
    { id: "3", label: "Next.js" }
  ]);

  const handleRemove = (id: string) => {
    const chipToRemove = chips.find(chip => chip.id === id);
    setChips(chips.filter(chip => chip.id !== id));
    
    if (chipToRemove) {
      addToast({
        variant: "danger",
        message: `Removed ${chipToRemove.label} chip`,
      });
    }
  };

  return (
    <Row gap="8" wrap>
      {chips.map(chip => (
        <Chip
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
      variant: "danger",
      message: `Removed ${label} chip`,
    });
  };

  return (
    <Row gap="16" horizontal="center">
      <Chip 
        label="Removable" 
        onRemove={() => handleRemove("Removable")} 
      />
      <Chip 
        label="With Icon" 
        prefixIcon="tag" 
        onRemove={() => handleRemove("With Icon")} 
      />
      <Chip 
        label="Custom Remove" 
        onRemove={() => handleRemove("Custom Remove")} 
        iconButtonProps={{ 
          icon: "trash", 
          tooltip: "Delete" 
        }} 
      />
    </Row>
  );
}

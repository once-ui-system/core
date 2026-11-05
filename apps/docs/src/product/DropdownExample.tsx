"use client";

import { Column, Icon, Line, Option } from "@once-ui-system/core";
import React, { useState } from "react";

export function BasicRawDropdown() {
  const [selected, setSelected] = useState("");

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  return (
    <Column border="neutral-medium" background="surface" gap="2" padding="4" radius="m-4">
      <Option
        label="Option 1"
        value="option1"
        selected={selected === "option1"}
        onClick={handleSelect}
      />
      <Option
        label="Option 2"
        value="option2"
        selected={selected === "option2"}
        onClick={handleSelect}
      />
      <Option
        label="Option 3"
        value="option3"
        selected={selected === "option3"}
        onClick={handleSelect}
      />
    </Column>
  );
}

export function IconsRawDropdown() {
  const [selected, setSelected] = useState("edit"); // Pre-select the Edit option

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  return (
    <Column border="neutral-medium" background="surface" gap="2" padding="8" radius="m-8">
      <Option
        label="Edit"
        value="edit"
        prefix={<Icon name="edit" size="xs" />}
        selected={selected === "edit"}
        onClick={handleSelect}
      />
      <Option
        label="Duplicate"
        value="duplicate"
        prefix={<Icon name="copy" size="xs" />}
        selected={selected === "duplicate"}
        onClick={handleSelect}
      />
      <Line marginY="8" />
      <Option
        label="Delete"
        value="delete"
        prefix={<Icon name="delete" size="xs" />}
        danger
        selected={selected === "delete"}
        onClick={handleSelect}
      />
    </Column>
  );
}

export function DescriptionRawDropdown() {
  const [selected, setSelected] = useState("apple"); // Pre-select Apple option

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  return (
    <Column border="neutral-medium" background="surface" gap="2" padding="8" radius="m-8">
      <Option
        label="Apple"
        value="apple"
        description="A fruit that grows on trees"
        selected={selected === "apple"}
        onClick={handleSelect}
      />
      <Option
        label="Banana"
        value="banana"
        description="A curved yellow fruit"
        selected={selected === "banana"}
        onClick={handleSelect}
      />
      <Option
        label="Carrot"
        value="carrot"
        description="An orange root vegetable"
        selected={selected === "carrot"}
        onClick={handleSelect}
      />
    </Column>
  );
}

export function CustomStyledRawDropdown() {
  const [selected, setSelected] = useState("medium"); // Pre-select Medium option

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  return (
    <Column
      gap="2"
      radius="m-8"
      border="brand-alpha-medium"
      background="brand-alpha-weak"
      shadow="xl"
      padding="8"
    >
      <Option label="Small" value="small" selected={selected === "small"} onClick={handleSelect} />
      <Option
        label="Medium"
        value="medium"
        selected={selected === "medium"}
        onClick={handleSelect}
      />
      <Option label="Large" value="large" selected={selected === "large"} onClick={handleSelect} />
    </Column>
  );
}

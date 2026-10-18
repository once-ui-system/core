"use client";

import React, { useState } from "react";
import { Slider } from "@once-ui-system/core";

export function SliderBasicExample() {
  const [value, setValue] = useState(50);

  return (
    <Slider
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      aria-label="Value"
    />
  );
}

export function SliderLabelExample() {
  const [value, setValue] = useState(50);

  return (
    <Slider
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      label="Volume"
    />
  );
}

export function SliderShowValueExample() {
  const [value, setValue] = useState(75);

  return (
    <Slider
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      label="Brightness"
      showValue
    />
  );
}

export function SliderStepExample() {
  const [value, setValue] = useState(50);

  return (
    <Slider
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      step={10}
      label="Volume"
      showValue
    />
  );
}

export function SliderMinMaxExample() {
  const [value, setValue] = useState(20);

  return (
    <Slider
      value={value}
      onValueChange={setValue}
      min={10}
      max={30}
      step={1}
      label="Temperature (°C)"
      showValue
    />
  );
}

export function SliderDisabledExample() {
  return (
    <Slider
      value={50}
      onValueChange={() => {}}
      min={0}
      max={100}
      label="Locked Setting"
      showValue
      disabled
    />
  );
}

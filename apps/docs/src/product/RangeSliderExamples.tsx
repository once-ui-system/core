"use client";

import { Column, RangeSlider, Text } from "@once-ui-system/core";
import { useState } from "react";

const price = (value: number) => `$${value}`;

export function RangeSliderPriceExample() {
  const [range, setRange] = useState<[number, number]>([120, 480]);

  return (
    <Column gap="16" fillWidth>
      <RangeSlider
        label="Price"
        min={0}
        max={600}
        step={10}
        minDistance={50}
        value={range}
        onValueChange={setRange}
        formatValue={price}
        showValue
      />
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        Showing products from {price(range[0])} to {price(range[1])}
      </Text>
    </Column>
  );
}

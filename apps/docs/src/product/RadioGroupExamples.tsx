"use client";

import { Column, RadioGroup, Text } from "@once-ui-system/core";
import { useState } from "react";

const PLANS = [
  { value: "monthly", label: "Monthly", description: "Billed every month at $9" },
  { value: "annual", label: "Annual", description: "Billed once a year at $90" },
  { value: "lifetime", label: "Lifetime", description: "One payment of $249" },
];

export function RadioGroupControlledExample() {
  const [plan, setPlan] = useState("annual");

  return (
    <Column gap="16">
      <RadioGroup label="Plan" name="plan" options={PLANS} value={plan} onChange={setPlan} />
      <Text variant="body-default-s" onBackground="neutral-weak">
        Selected: {plan}
      </Text>
    </Column>
  );
}

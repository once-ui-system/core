"use client";

import React, { useState } from "react";
import { RadioButton, Column, Text } from "@once-ui-system/core";

// Radio button group example with state management
export function SubscriptionRadioGroup() {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  
  const handleToggle = (value: string) => {
    setSelectedPlan(value);
  };
  
  return (
    <Column gap="16">
      <RadioButton
        name="subscription"
        value="monthly"
        label="Monthly subscription"
        description="Billed monthly at $9.99"
        isChecked={selectedPlan === "monthly"}
        onToggle={() => handleToggle("monthly")}
      />
      <RadioButton
        name="subscription"
        value="annual"
        label="Annual subscription"
        description="Billed annually at $99.99"
        isChecked={selectedPlan === "annual"}
        onToggle={() => handleToggle("annual")}
      />
      <RadioButton
        name="subscription"
        value="lifetime"
        label="Lifetime access"
        description="One-time payment of $299.99"
        isChecked={selectedPlan === "lifetime"}
        onToggle={() => handleToggle("lifetime")}
      />
      <Text 
        variant="body-default-s" 
        onBackground="neutral-medium"
        marginTop="8"
      >
        Selected plan: {selectedPlan}
      </Text>
    </Column>
  );
}

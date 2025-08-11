"use client";

import React from "react";
import { InteractiveDetails, Checkbox, RadioButton, Column } from "@once-ui-system/core";

// Basic InteractiveDetails examples
export function InteractiveDetailsExample() {
  return (
    <Column gap="24" fillWidth>
      <InteractiveDetails 
        label="Basic label" 
        onClick={() => {}}
      />
      <InteractiveDetails 
        label="With description" 
        description="This is a description for the interactive element"
        onClick={() => {}}
      />
      <InteractiveDetails 
        label="With help tooltip" 
        iconButtonProps={{ tooltip: "Help tooltip", tooltipPosition: "right" }}
        onClick={() => {}}
      />
    </Column>
  );
}

// Example showing InteractiveDetails with form controls
export function FormControlsExample() {
  return (
    <Column gap="16">
      <Checkbox 
        label="Checkbox with InteractiveDetails"
        description="This checkbox uses InteractiveDetails for its label and description"
      />
      <RadioButton 
        label="Radio button with InteractiveDetails"
        description="This radio button uses InteractiveDetails for its label and description"
      />
    </Column>
  );
}

// Example showing InteractiveDetails with tooltips
export function TooltipExample() {
  return (
    <Column gap="16">
      <InteractiveDetails 
        label="With tooltip on top"
        iconButtonProps={{ 
          tooltip: "This tooltip appears on top", 
          tooltipPosition: "top" 
        }}
        onClick={() => {}}
      />
      <InteractiveDetails 
        label="With tooltip on right"
        iconButtonProps={{ 
          tooltip: "This tooltip appears on the right", 
          tooltipPosition: "right" 
        }}
        onClick={() => {}}
      />
    </Column>
  );
}

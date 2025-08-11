"use client";

import React, { useState } from "react";
import { Switch, Flex } from "@once-ui-system/core";

// Basic switch with state management
export function BasicSwitch() {
  const [isChecked, setIsChecked] = useState(false);
  
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };
  
  return (
    <Switch
      label="Enable notifications"
      description="Receive updates about new features and improvements"
      isChecked={isChecked}
      onToggle={handleToggle}
    />
  );
}

// Switch with feedback text
export function SwitchWithFeedback() {
  const [isChecked, setIsChecked] = useState(false);
  
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };
  
  return (
    <Flex fillWidth gap="8">
      <Switch
        label={isChecked ? "Feature is now enabled" : "Feature is currently disabled"}
        isChecked={isChecked}
        onToggle={handleToggle}
      />
    </Flex>
  );
}

// Switch with loading state simulation
export function SwitchWithLoading() {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggle = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsChecked(!isChecked);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <Switch
      label="Processing"
      isChecked={isChecked}
      loading={isLoading}
      onToggle={handleToggle}
    />
  );
}

// Reversed layout switch
export function ReversedSwitch() {
  const [isChecked, setIsChecked] = useState(false);
  
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };
  
  return (
    <Switch
      label="Align switch to the right"
      description="This places the switch after the label text"
      reverse
      isChecked={isChecked}
      onToggle={handleToggle}
    />
  );
}

// Client-side wrapper for Switch to be used directly in MDX
export function ClientSwitch(props: React.ComponentProps<typeof Switch>) {
  const [isChecked, setIsChecked] = useState(props.isChecked || false);
  
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };
  
  return (
    <Switch
      {...props}
      isChecked={isChecked}
      onToggle={props.onToggle || handleToggle}
    />
  );
}

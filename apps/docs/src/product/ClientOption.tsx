"use client";

import { Option } from "@once-ui-system/core";
import type { OptionProps } from "@once-ui-system/core";
import React from "react";

// This is a client-side wrapper for the Option component
// to be used in MDX documentation
export function ClientOption(props: OptionProps) {
  // Provide a no-op onClick handler if none is provided
  const handleClick = (value: string) => {
    console.log(`Option clicked: ${value}`);
  };

  return <Option {...props} onClick={props.onClick || handleClick} />;
}

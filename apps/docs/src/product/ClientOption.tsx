"use client";

import { Option } from "@once-ui-system/core";
import type { OptionProps } from "@once-ui-system/core";
import React from "react";

// This is a client-side wrapper for the Option component
// to be used in MDX documentation
export function ClientOption(props: OptionProps) {
  // Provide a no-op onClick handler if none is provided
  const handleClick = (value: string) => {
    // Option clicked
  };

  // An option is only valid inside a listbox, which the demo stands in for.
  return (
    <div role="listbox" aria-label={typeof props.label === "string" ? props.label : "Options"}>
      <Option {...props} onClick={props.onClick || handleClick} />
    </div>
  );
}

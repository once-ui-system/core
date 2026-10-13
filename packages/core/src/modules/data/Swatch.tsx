"use client";

import React from "react";
import { Row } from "../../components/Row";
import { useDataTheme } from "../../contexts/DataThemeProvider";
import { RadiusSize, SpacingToken } from "../../types";
import { ChartVariant } from "./interfaces";

export interface SwatchProps {
  color: string;
  size?: "s" | "m";
  variant?: ChartVariant;
}

export const Swatch: React.FC<SwatchProps> = ({ color, size = "m", variant: variantProp }) => {
  // Read the theme on every render: as a default parameter the hook ran only
  // when `variant` was omitted.
  const theme = useDataTheme();
  const variant = variantProp ?? theme.variant;

  const sizeMap: Record<
    string,
    { minWidth: SpacingToken; minHeight: SpacingToken; radius: RadiusSize }
  > = {
    s: {
      minWidth: "12",
      minHeight: "12",
      radius: "xs",
    },
    m: {
      minWidth: "16",
      minHeight: "16",
      radius: "s",
    },
  };

  const getStyleByVariant = () => {
    const baseStyle = {
      backgroundClip: "padding-box",
      border: `1px solid ${color}`,
    };

    switch (variant) {
      case "flat":
        return {
          ...baseStyle,
          background: color,
        };
      case "outline":
        return {
          ...baseStyle,
          background: "transparent",
        };
      case "gradient":
      default:
        return {
          ...baseStyle,
          background: `linear-gradient(to bottom, ${color} 0%, transparent 100%)`,
        };
    }
  };

  return (
    <Row
      style={getStyleByVariant()}
      minWidth={sizeMap[size].minWidth}
      minHeight={sizeMap[size].minHeight}
      radius={sizeMap[size].radius}
    />
  );
};

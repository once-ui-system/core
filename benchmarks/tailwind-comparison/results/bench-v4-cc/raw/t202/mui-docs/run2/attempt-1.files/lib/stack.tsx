"use client";

import * as React from "react";
import MuiStack from "@mui/material/Stack";
import type { StackProps } from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";

type Responsive<T> = T | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", T>>;

type Props = {
  children?: React.ReactNode;
  direction?: StackProps["direction"];
  spacing?: StackProps["spacing"];
  alignItems?: Responsive<string>;
  justifyContent?: Responsive<string>;
  flexWrap?: Responsive<string>;
  gap?: Responsive<number>;
  component?: React.ElementType;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  "aria-label"?: string;
};

const Base = MuiStack as React.ElementType;

/** Stack with the flex layout props written out (they are sx-only in Material UI 9). */
export default function Stack({ alignItems, justifyContent, flexWrap, gap, sx, ...rest }: Props) {
  const layout = { alignItems, justifyContent, flexWrap, gap };
  return <Base {...rest} sx={[layout, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} />;
}

import * as React from "react";
import MuiStack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";

// Material UI 9 keeps flex layout out of Stack's props: it goes through sx.
// This thin wrapper keeps call sites short (gap, alignItems, ...) and forwards everything to Stack.
type FlexProps = {
  gap?: number;
  columnGap?: number;
  rowGap?: number;
  alignItems?: string;
  justifyContent?: string;
  flexWrap?: string;
  direction?: "row" | "column";
  component?: React.ElementType;
  sx?: SxProps<Theme>;
};

type Props = FlexProps & Omit<React.ComponentPropsWithoutRef<"div">, "color">;

const Base = MuiStack as React.ElementType;

export default function Stack({ gap, columnGap, rowGap, alignItems, justifyContent, flexWrap, sx, ...rest }: Props) {
  const flex = { gap, columnGap, rowGap, alignItems, justifyContent, flexWrap };
  return <Base {...rest} sx={[flex, ...(Array.isArray(sx) ? sx : [sx])]} />;
}

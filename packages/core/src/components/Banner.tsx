import type { ReactNode } from "react";
import { forwardRef } from "react";
import { Row, type RowProps } from "./Row";

export interface BannerProps extends RowProps {
  children?: ReactNode;
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      children,
      fillWidth = true,
      paddingX = "16",
      paddingY = "8",
      solid = "brand-medium",
      onSolid = "brand-strong",
      textVariant = "label-default-s",
      align = "center",
      center = true,
      gap = "12",
      ...flex
    },
    ref,
  ) => {
    const hasExplicitAlign = Boolean(flex.horizontal || flex.vertical);
    const resolvedCenter = hasExplicitAlign && !("center" in flex) ? false : center;
    const resolvedVertical = hasExplicitAlign && !flex.vertical ? "center" : flex.vertical;

    return (
      <Row
        fillWidth={fillWidth}
        paddingX={paddingX}
        paddingY={paddingY}
        solid={solid}
        onSolid={onSolid}
        textVariant={textVariant}
        align={align}
        center={resolvedCenter}
        vertical={resolvedVertical}
        gap={gap}
        ref={ref}
        {...flex}
      >
        {children}
      </Row>
    );
  },
);

Banner.displayName = "Banner";

export { Banner };

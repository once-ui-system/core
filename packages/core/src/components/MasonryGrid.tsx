import React, { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Flex } from "./Flex";
import { SpacingToken } from "../types";

// Utility to parse token to CSS value
function parseToken(value: SpacingToken | "-1" | number | undefined, type: "width" | "height") {
    if (value === undefined) return undefined;
    if (typeof value === "number") return `${value}rem`;
    if (
        [
            "0",
            "1",
            "2",
            "4",
            "8",
            "12",
            "16",
            "20",
            "24",
            "32",
            "40",
            "48",
            "56",
            "64",
            "80",
            "104",
            "128",
            "160",
        ].includes(value)
    ) {
        return `var(--static-space-${value})`;
    }
    if (["xs", "s", "m", "l", "xl"].includes(value)) {
        return `var(--responsive-${type}-${value})`;
    }
    return undefined;
}

export interface MasonryGridProps extends React.ComponentProps<typeof Flex> {
    children: ReactNode;
    columnWidth?: SpacingToken | number | undefined;
    gap?: SpacingToken | "-1" | undefined;
    style?: CSSProperties;
    className?: string;
}

export const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
    ({ children, columnWidth = "24", gap = "8", style, className, ...rest }, ref) => {
        // Masonry effect using CSS columns
        const columnWidthValue = parseToken(columnWidth, "width") ?? "160px";
        const gapValue = parseToken(gap, "width") ?? "16px";
        const masonryStyle: CSSProperties = {
            display: "block", // force block for columns layout
            columnWidth: columnWidthValue,
            columnGap: gapValue,
            ...style,
        };
        return (
            <Flex ref={ref} style={masonryStyle} className={className} {...rest}>
                {/* Each child should be block-level for proper masonry effect */}
                {React.Children.map(children, (child) => (
                    <div
                        style={{
                            breakInside: "avoid",
                            marginBottom: gapValue,
                            width: columnWidthValue,
                            height: "fit-content",
                            minWidth: columnWidthValue,
                        }}
                    >
                        {child}
                    </div>
                ))}
            </Flex>
        );
    },
);
MasonryGrid.displayName = "MasonryGrid";

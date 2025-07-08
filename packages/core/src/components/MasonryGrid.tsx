"use client";

import { forwardRef } from "react";

import { Flex } from ".";
import styles from "./MasonryGrid.module.scss";
import {SpacingToken} from "@/types";

interface MasonryGridProps extends React.ComponentProps<typeof Flex>{
    rowWidth?: number | SpacingToken;
    autoRows?: string;
}

const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
    ({ rowWidth, autoRows, className, style, ...rest }, ref) => {

        const parseDimension = (
            value: number | SpacingToken | undefined,
            type: "width" | "height",
        ): string | undefined => {
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
        };

        const parsed = {
            rowWidth: parseDimension(rowWidth, "width"),
        }

        return (
            <Flex
                ref={ref}
                className={`${styles.grid} ${className}`}
                style={{
                    ...style,
                    gridTemplateColumns: `repeat(auto-fit, minmax(${ parsed.rowWidth ? parsed.rowWidth : `160px`}, 1fr))`,
                    gridAutoRows: autoRows ? autoRows : `10px`
                }}
                {...rest}
            >
                {/* children go here */}
            </Flex>
        );
    }
);

MasonryGrid.displayName = "MasonryGrid";

export default MasonryGrid;
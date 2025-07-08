"use client";

import React, {forwardRef, useEffect} from "react";

import { Flex } from ".";
import { SpacingToken } from "@/types";

interface MasonryChildProps extends React.ComponentProps<typeof Flex>{
    additionalHeight?: number;
}

const MasonryChild = forwardRef<HTMLDivElement, MasonryChildProps>(
    ({ width, height, additionalHeight = 0, className, style, ...rest }, ref) => {
        const [parsed, setParsed] = React.useState<{ width?: number, height?: number }>({});

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

        const resolveToPx = (value: string | undefined, context: HTMLElement = document.body): number | undefined => {
            if (!value) return undefined;
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.visibility = 'hidden';
            el.style.height = value;
            context.appendChild(el);

            const computed = getComputedStyle(el).height;
            context.removeChild(el);

            const px = parseFloat(computed);
            return isNaN(px) ? undefined : px;
        }

        useEffect(() => {
            const widthPx = resolveToPx(parseDimension(width, 'width'), document.body);
            const heightPx = resolveToPx(parseDimension(height, 'height'), document.body);

            setParsed({
                width: widthPx,
                height: heightPx,
            });
        }, [width, height]);

        return (
            <Flex
                ref={ref}
                className={`masonry-child ${className ?? ""}`}
                style={{
                    ...style,
                    gridRow:
                        (parsed.height && parsed.width)
                            ? `span ${Math.ceil(Math.ceil(parsed.width * (parsed.height) / parsed.width) / 10) + additionalHeight}`
                            : undefined,
                    justifySelf: "center",
                    margin: 0,
                    width: parsed.width ? `${parsed.width}px` : undefined,
                    height: parsed.height ? `${parsed.height}px` : undefined,
                } as React.CSSProperties}
                fit
                {...rest}
            >
                {/* children go here */}
            </Flex>
        );
    }
);

MasonryChild.displayName = "MasonryChild";

export default MasonryChild;
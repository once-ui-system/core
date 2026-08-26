import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, memo, useMemo } from "react";
import { cn } from "../classes/utils";
import { Background } from "./Background";
import { Row, type RowProps } from "./Row";

export const blobFxVariants = cva("blur-[2rem]");
const BLOB_FX_BASE = blobFxVariants();

export interface BlobFxProps extends RowProps {
  seed?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const BlobFx = forwardRef<HTMLDivElement, BlobFxProps>(
  ({ seed = 0, className, style, children, ...rest }, ref) => {
    // Generate pseudo-random values based on seed for consistent variation
    const { durations, offsets } = useMemo(() => {
      const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
      const random2 = ((seed * 4877 + 37991) % 233280) / 233280;
      const random3 = ((seed * 7919 + 28411) % 233280) / 233280;

      return {
        durations: {
          d1: 8 + (random1 - 0.5) * 3.2, // 6.4 - 9.6s
          d2: 12 + (random2 - 0.5) * 4.8, // 9.6 - 14.4s
          d3: 10 + (random3 - 0.5) * 4, // 8 - 12s
        },
        offsets: {
          o1: 1 + (random1 - 0.5) * 0.6, // 0.7 - 1.3
          o2: 1 + (random2 - 0.5) * 0.6,
          o3: 1 + (random3 - 0.5) * 0.6,
        },
      };
    }, [seed]);

    const blob1Style = useMemo<CSSProperties>(
      () =>
        ({
          "--blob-1-33": `${4 * offsets.o1}rem`,
          "--blob-1-66": `${-3 * offsets.o1}rem`,
          animation: `blob-fx-1 ${durations.d1}s ease-in-out infinite`,
        }) as CSSProperties,
      [offsets.o1, durations.d1],
    );

    const blob2Style = useMemo<CSSProperties>(
      () =>
        ({
          "--blob-2-33": `${-7 * offsets.o2}rem`,
          "--blob-2-66": `${5 * offsets.o2}rem`,
          animation: `blob-fx-2 ${durations.d2}s ease-in-out infinite`,
        }) as CSSProperties,
      [offsets.o2, durations.d2],
    );

    const blob3Style = useMemo<CSSProperties>(
      () =>
        ({
          "--blob-3-33": `${6 * offsets.o3}rem`,
          "--blob-3-66": `${-6 * offsets.o3}rem`,
          animation: `blob-fx-3 ${durations.d3}s ease-in-out infinite`,
        }) as CSSProperties,
      [offsets.o3, durations.d3],
    );

    return (
      <Row
        ref={ref}
        fill
        pointerEvents="none"
        overflow="hidden"
        className={cn(BLOB_FX_BASE, className)}
        style={style}
        {...rest}
      >
        {/* Blob 2 - Accent Strong */}
        <Background
          position="absolute"
          fill
          bottom="0"
          left="0"
          gradient={{
            display: true,
            colorStart: "accent-solid-weak",
            width: 38,
            height: 35,
          }}
          style={blob2Style}
        />

        {/* Blob 3 - Brand Weak */}
        <Background
          position="absolute"
          fill
          bottom="0"
          left="-20%"
          className="mix-blend-plus-lighter"
          gradient={{
            display: true,
            colorStart: "accent-solid-medium",
            width: 42,
            height: 25,
          }}
          style={blob3Style}
        />

        {/* Blob 1 - Brand Strong */}
        <Background
          position="absolute"
          fill
          bottom="0"
          left="10%"
          className="mix-blend-screen"
          gradient={{
            display: true,
            colorStart: "brand-solid-strong",
            width: 50,
            height: 35,
          }}
          style={blob1Style}
        />

        {children}
      </Row>
    );
  },
);

BlobFx.displayName = "BlobFx";

export default memo(BlobFx);
export { BlobFx };

"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../classes/utils";
import { useInViewport } from "../hooks/useInViewport";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Flex, type FlexComponentProps } from "./Flex";

export const holoFxVariants = cva("isolate z-0 group/holo relative overflow-hidden");
const HOLO_FX_BASE = holoFxVariants();

export const holoFxOverlayVariants = cva(
  "opacity-0 transition-opacity duration-300 ease-in-out pointer-events-none",
  {
    variants: {
      layer: {
        burn: "group-hover/holo:opacity-[var(--burn-opacity)] group-hover/holo:translate-x-[1px] group-hover/holo:translate-y-[1px] group-hover/holo:z-[1]",
        shine:
          "group-hover/holo:opacity-[var(--shine-opacity,var(--light-opacity))] group-hover/holo:translate-x-[-1px] group-hover/holo:translate-y-[-1px] group-hover/holo:z-[2]",
        texture:
          "group-hover/holo:opacity-[var(--texture-opacity)] group-hover/holo:translate-x-[calc(var(--gradient-pos-x)/50)] group-hover/holo:scale-110 [background-size:150%_150%] bg-center group-hover/holo:z-[3]",
      },
    },
  },
);
const BURN_OVERLAY_BASE = holoFxOverlayVariants({ layer: "burn" });
const SHINE_OVERLAY_BASE = holoFxOverlayVariants({ layer: "shine" });
const TEXTURE_OVERLAY_BASE = holoFxOverlayVariants({ layer: "texture" });

export interface MaskOptions {
  maskPosition?: string;
}

export interface HoloFxProps extends FlexComponentProps {
  children?: ReactNode;
  reducedMotion?: boolean | "auto";
  shine?: {
    opacity?: number;
    filter?: string;
    blending?: CSSProperties["mixBlendMode"];
    mask?: MaskOptions;
  };
  burn?: {
    opacity?: number;
    filter?: string;
    blending?: CSSProperties["mixBlendMode"];
    mask?: MaskOptions;
  };
  texture?: {
    opacity?: number;
    filter?: string;
    blending?: CSSProperties["mixBlendMode"];
    image?: string;
    mask?: MaskOptions;
  };
}

const formatMask = (maskPosition = "100 200"): string => {
  const [x, y] = maskPosition.split(" ");
  const formattedX = `${x}%`;
  const formattedY = `${y || x}%`;
  return `radial-gradient(ellipse ${formattedX} ${formattedY} at var(--gradient-pos-x, 50%) var(--gradient-pos-y, 50%), black 50%, transparent 100%)`;
};

const HoloFx = forwardRef<HTMLDivElement, HoloFxProps>(
  ({ children, reducedMotion = "auto", shine, burn, texture, className, style, ...rest }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const lastCallRef = useRef<number>(0);

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    const isInViewport = useInViewport(internalRef);
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const isActive = isInViewport && shouldAnimate;

    const shineDefaults = useMemo(
      () => ({
        opacity: shine?.opacity ?? 30,
        blending: shine?.blending ?? ("color-dodge" as CSSProperties["mixBlendMode"]),
        mask: formatMask(shine?.mask?.maskPosition),
        filter: shine?.filter,
      }),
      [shine?.opacity, shine?.blending, shine?.mask?.maskPosition, shine?.filter],
    );

    const burnDefaults = useMemo(
      () => ({
        opacity: burn?.opacity ?? 30,
        filter: burn?.filter ?? "brightness(0.2) contrast(2)",
        blending: burn?.blending ?? ("color-dodge" as CSSProperties["mixBlendMode"]),
        mask: formatMask(burn?.mask?.maskPosition),
      }),
      [burn?.opacity, burn?.filter, burn?.blending, burn?.mask?.maskPosition],
    );

    const textureDefaults = useMemo(
      () => ({
        opacity: texture?.opacity ?? 10,
        blending: texture?.blending ?? ("color-dodge" as CSSProperties["mixBlendMode"]),
        image:
          texture?.image ??
          "repeating-linear-gradient(-45deg, var(--static-white) 0, var(--static-white) 1px, transparent 3px, transparent 2px)",
        filter: texture?.filter,
        mask: formatMask(texture?.mask?.maskPosition),
      }),
      [
        texture?.opacity,
        texture?.blending,
        texture?.image,
        texture?.filter,
        texture?.mask?.maskPosition,
      ],
    );

    const burnStyle = useMemo<CSSProperties>(
      () => ({
        ["--burn-opacity" as string]: `${burnDefaults.opacity}%`,
        filter: burnDefaults.filter,
        mixBlendMode: burnDefaults.blending,
        maskImage: burnDefaults.mask,
        WebkitMaskImage: burnDefaults.mask,
      }),
      [burnDefaults],
    );

    const shineStyle = useMemo<CSSProperties>(
      () => ({
        ["--shine-opacity" as string]: `${shineDefaults.opacity}%`,
        ["--light-opacity" as string]: `${shineDefaults.opacity}%`,
        filter: shineDefaults.filter,
        mixBlendMode: shineDefaults.blending,
        maskImage: shineDefaults.mask,
        WebkitMaskImage: shineDefaults.mask,
      }),
      [shineDefaults],
    );

    const textureStyle = useMemo<CSSProperties>(
      () => ({
        ["--texture-opacity" as string]: `${textureDefaults.opacity}%`,
        backgroundImage: textureDefaults.image,
        filter: textureDefaults.filter,
        mixBlendMode: textureDefaults.blending,
        maskImage: textureDefaults.mask,
        WebkitMaskImage: textureDefaults.mask,
      }),
      [textureDefaults],
    );

    useEffect(() => {
      if (!isActive) return;

      const handleMouseMove = (event: MouseEvent) => {
        const now = Date.now();
        if (now - lastCallRef.current < 16) return;
        lastCallRef.current = now;

        const element = internalRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = ((offsetX - centerX) / centerX) * 100;
        const deltaY = ((offsetY - centerY) / centerY) * 100;

        element.style.setProperty("--gradient-pos-x", `${deltaX}%`);
        element.style.setProperty("--gradient-pos-y", `${deltaY}%`);
      };

      document.addEventListener("mousemove", handleMouseMove, { passive: true });

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, [isActive]);

    return (
      <Flex
        ref={mergedRef}
        position="relative"
        overflow="hidden"
        className={cn(HOLO_FX_BASE, className)}
        style={style}
        {...rest}
      >
        <Flex fill>{children}</Flex>
        <Flex
          m={{ hide: true }}
          position="absolute"
          fill
          pointerEvents="none"
          className={BURN_OVERLAY_BASE}
          style={burnStyle}
        >
          {children}
        </Flex>
        <Flex
          m={{ hide: true }}
          position="absolute"
          fill
          pointerEvents="none"
          className={SHINE_OVERLAY_BASE}
          style={shineStyle}
        >
          {children}
        </Flex>
        <Flex
          m={{ hide: true }}
          position="absolute"
          fill
          pointerEvents="none"
          className={TEXTURE_OVERLAY_BASE}
          style={textureStyle}
        />
      </Flex>
    );
  },
);

HoloFx.displayName = "HoloFx";

export { HoloFx };

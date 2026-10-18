"use client";

import { Flex, useInViewport, useReducedMotion } from "@once-ui-system/core";
import classNames from "clsx";
import type React from "react";
import { type CSSProperties, useCallback, useEffect, useRef } from "react";
import styles from "./HoloFx.module.scss";

interface MaskOptions {
  maskPosition?: string;
}

interface HoloFxProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
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

const formatMask = (maskPosition: string = "100 200"): string => {
  const [x, y] = maskPosition.split(" ");
  const formattedX = `${x}%`;
  const formattedY = `${y ? y : x}%`;
  return `radial-gradient(ellipse ${formattedX} ${formattedY} at var(--gradient-pos-x, 50%) var(--gradient-pos-y, 50%), black 50%, transparent 100%)`;
};

const getMaskStyle = (mask?: MaskOptions): string => {
  return mask?.maskPosition ? formatMask(mask.maskPosition) : formatMask();
};

const HoloFx = ({
  ref,
  children,
  reducedMotion = "auto",
  shine,
  burn,
  texture,
  ...rest
}: HoloFxProps) => {
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

  const shineDefaults = {
    opacity: 30,
    blending: "color-dodge" as CSSProperties["mixBlendMode"],
    ...shine,
    // After the spread: `shine.mask` is the options object, not the CSS mask.
    mask: getMaskStyle(shine?.mask),
  };

  const burnDefaults = {
    opacity: 30,
    filter: "brightness(0.2) contrast(2)",
    blending: "color-dodge" as CSSProperties["mixBlendMode"],
    ...burn,
    // After the spread: `burn.mask` is the options object, not the CSS mask.
    mask: getMaskStyle(burn?.mask),
  };

  const textureDefaults = {
    opacity: 10,
    blending: "color-dodge" as CSSProperties["mixBlendMode"],
    image:
      "repeating-linear-gradient(-45deg, var(--static-white) 0, var(--static-white) 1px, transparent 3px, transparent 2px)",
    ...texture,
    // After the spread: `texture.mask` is the options object, not the CSS mask.
    mask: getMaskStyle(texture?.mask),
  };

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
    <Flex overflow="hidden" className={styles.holoFx} ref={mergedRef} {...rest}>
      <Flex fill className={styles.base}>
        {children}
      </Flex>
      <Flex
        m={{ hide: true }}
        position="absolute"
        fill
        pointerEvents="none"
        className={classNames(styles.overlay, styles.burn)}
        // Decorative copies of the content: read and tabbed to once, in the base layer.
        aria-hidden="true"
        inert
        style={{
          ["--burn-opacity" as any]: burnDefaults.opacity + "%",
          filter: burnDefaults.filter,
          mixBlendMode: burnDefaults.blending,
          maskImage: burnDefaults.mask as string,
        }}
      >
        {children}
      </Flex>
      <Flex
        m={{ hide: true }}
        position="absolute"
        fill
        pointerEvents="none"
        className={classNames(styles.overlay, styles.shine)}
        // Decorative copies of the content: read and tabbed to once, in the base layer.
        aria-hidden="true"
        inert
        style={{
          ["--shine-opacity" as any]: shineDefaults.opacity + "%",
          filter: shineDefaults.filter,
          mixBlendMode: shineDefaults.blending,
          maskImage: shineDefaults.mask as string,
        }}
      >
        {children}
      </Flex>
      <Flex
        m={{ hide: true }}
        position="absolute"
        fill
        pointerEvents="none"
        className={classNames(styles.overlay, styles.texture)}
        aria-hidden="true"
        style={{
          ["--texture-opacity" as any]: textureDefaults.opacity + "%",
          backgroundImage: textureDefaults.image,
          filter: textureDefaults.filter,
          mixBlendMode: textureDefaults.blending,
          maskImage: textureDefaults.mask as string,
        }}
      ></Flex>
    </Flex>
  );
};

HoloFx.displayName = "HoloFx";

export { HoloFx };

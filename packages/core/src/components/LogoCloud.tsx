"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";
import { Grid, type GridComponentProps } from "./Grid";
import { Logo, type LogoProps } from "./Logo";

export const logoCloudVariants = cva("");

export const logoCloudItemVariants = cva("origin-center will-change-[opacity,filter,transform]", {
  variants: {
    rotating: {
      true: "animate-logoFadeInOut",
      false: "animate-logoFadeIn",
    },
  },
  defaultVariants: {
    rotating: false,
  },
});

export interface LogoCloudProps extends GridComponentProps {
  logos: LogoProps[];
  className?: string;
  style?: CSSProperties;
  limit?: number;
  rotationInterval?: number;
}

const ANIMATION_DURATION = 5000;
const STAGGER_DELAY = 25;

const LogoCloud = forwardRef<HTMLDivElement, LogoCloudProps>(
  ({ logos, className, style, limit = 6, rotationInterval = ANIMATION_DURATION, ...rest }, ref) => {
    const [visibleLogos, setVisibleLogos] = useState<LogoProps[]>(() => logos.slice(0, limit));
    const [key, setKey] = useState(0);
    const shouldRotate = logos.length > limit;

    useEffect(() => {
      if (!shouldRotate) {
        setVisibleLogos(logos);
        return;
      }

      const interval = setInterval(
        () => {
          setVisibleLogos((currentLogos) => {
            const currentIndices = currentLogos.map((logo) => logos.indexOf(logo));

            const nextIndices = currentIndices
              .map((index) => (index + 1) % logos.length)
              .sort((a, b) => a - b);

            const nextLogos = nextIndices.map((index) => logos[index]);
            setKey((k) => k + 1);
            return nextLogos;
          });
        },
        rotationInterval + STAGGER_DELAY * limit,
      );

      return () => clearInterval(interval);
    }, [logos, limit, rotationInterval, shouldRotate]);

    return (
      <Grid ref={ref} className={cn(logoCloudVariants(), className)} style={style} {...rest}>
        {visibleLogos.map((logo, index) => (
          <Flex
            // biome-ignore lint/suspicious/noArrayIndexKey: Logo slots are positional with rotating keys
            key={`${key}-${index}`}
            vertical="center"
            horizontal="center"
            paddingX="24"
            paddingY="20"
            radius="l"
          >
            <Logo
              {...logo}
              className={cn(logoCloudItemVariants({ rotating: shouldRotate }), logo.className)}
              style={{
                ...logo.style,
                animationDelay: `${index * STAGGER_DELAY}ms`,
              }}
            />
          </Flex>
        ))}
      </Grid>
    );
  },
);

LogoCloud.displayName = "LogoCloud";

export { LogoCloud };

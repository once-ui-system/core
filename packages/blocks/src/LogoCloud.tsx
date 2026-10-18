"use client";

import { Flex, Grid, Logo, useReducedMotion } from "@once-ui-system/core";
import classNames from "clsx";
import type React from "react";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import styles from "./LogoCloud.module.scss";
import { prefersReducedMotionNow } from "./internal/reducedMotion.js";

type LogoProps = ComponentProps<typeof Logo>;

interface LogoCloudProps extends React.ComponentProps<typeof Grid> {
  logos: LogoProps[];
  className?: string;
  style?: React.CSSProperties;
  limit?: number;
  rotationInterval?: number;
}

const ANIMATION_DURATION = 5000;
const STAGGER_DELAY = 25;

const LogoCloud = ({
  ref,
  logos,
  className,
  style,
  limit = 6,
  rotationInterval = ANIMATION_DURATION,
  ...rest
}: LogoCloudProps) => {
  const [visibleLogos, setVisibleLogos] = useState<LogoProps[]>(() => logos.slice(0, limit));
  const [key, setKey] = useState(0);
  const { prefersReducedMotion } = useReducedMotion();
  // Under reduced motion the first `limit` logos stay put: no rotation.
  const shouldRotate = logos.length > limit && !prefersReducedMotion;

  useEffect(() => {
    if (logos.length <= limit) {
      setVisibleLogos(logos);
      return;
    }
    if (!shouldRotate || prefersReducedMotionNow()) {
      setVisibleLogos(logos.slice(0, limit));
      return;
    }

    const interval = setInterval(
      () => {
        setVisibleLogos((currentLogos) => {
          const currentIndices = currentLogos.map((logo) => logos.findIndex((l) => l === logo));

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
    <Grid ref={ref} className={classNames(styles.container, className)} style={style} {...rest}>
      {visibleLogos.map((logo, index) => (
        <Flex
          key={`${key}-${index}`}
          vertical="center"
          horizontal="center"
          paddingX="24"
          paddingY="20"
          radius="l"
        >
          <Logo
            {...logo}
            className={classNames(shouldRotate ? styles.logo : styles.staticLogo, logo.className)}
            style={{
              ...logo.style,
              animationDelay: `${index * STAGGER_DELAY}ms`,
            }}
          />
        </Flex>
      ))}
    </Grid>
  );
};

LogoCloud.displayName = "LogoCloud";

export { LogoCloud };

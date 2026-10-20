"use client";

import classNames from "clsx";
import { forwardRef, useEffect, useRef } from "react";
import { composeTransform, translateTransform } from "../utils/layoutClasses";
import styles from "./Arrow.module.scss";
import { Flex } from "./Flex";

interface ArrowProps extends React.ComponentProps<typeof Flex> {
  trigger: string;
  scale?: number;
  color?: "onBackground" | "onSolid";
  style?: React.CSSProperties;
  className?: string;
}

const Arrow = forwardRef<HTMLDivElement, ArrowProps>(
  (
    {
      trigger,
      scale = 0.8,
      color = "onBackground",
      style,
      className,
      translateX,
      translateY,
      as,
      ...flex
    },
    _ref,
  ) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const triggerElement = document.querySelector(trigger);

      if (triggerElement && ref.current) {
        const handleMouseOver = () => {
          ref.current?.classList.add(styles.active);
        };

        const handleMouseOut = () => {
          ref.current?.classList.remove(styles.active);
        };

        triggerElement.addEventListener("mouseenter", handleMouseOver);
        triggerElement.addEventListener("mouseleave", handleMouseOut);

        return () => {
          triggerElement.removeEventListener("mouseenter", handleMouseOver);
          triggerElement.removeEventListener("mouseleave", handleMouseOut);
        };
      }
    }, [trigger]);

    return (
      <Flex
        ref={ref}
        as={as}
        center
        className={classNames(styles.arrowContainer, className)}
        style={{
          // The scale composes with a translate prop instead of replacing the
          // transform Flex would have written for it.
          transform: composeTransform(
            translateTransform(translateX, translateY),
            `scale(${scale})`,
          ),
          ...style,
        }}
        {...flex}
      >
        <Flex
          as={as === "span" ? "span" : undefined}
          radius="full"
          position="absolute"
          className={classNames(styles.arrowHead, styles[color])}
          height={0.0875}
        />
        <Flex
          as={as === "span" ? "span" : undefined}
          radius="full"
          position="absolute"
          className={classNames(styles.arrowHead, styles[color])}
          height={0.0875}
        />
      </Flex>
    );
  },
);

Arrow.displayName = "Arrow";

export { Arrow };

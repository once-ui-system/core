"use client";

import classNames from "clsx";
import { forwardRef, useEffect, useRef } from "react";
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
  ({ trigger, scale = 0.8, color = "onBackground", style, className, ...flex }, _ref) => {
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
        center
        className={classNames(styles.arrowContainer, className)}
        style={{
          transform: `scale(${scale})`,
          ...style,
        }}
        {...flex}
      >
        <Flex
          radius="full"
          position="absolute"
          className={classNames(styles.arrowHead, styles[color])}
          height="0.0875rem"
        />
        <Flex
          radius="full"
          position="absolute"
          className={classNames(styles.arrowHead, styles[color])}
          height="0.0875rem"
        />
      </Flex>
    );
  },
);

Arrow.displayName = "Arrow";

export { Arrow };

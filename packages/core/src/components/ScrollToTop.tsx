"use client";

import classNames from "clsx";
import { useEffect, useState } from "react";
import { Flex } from "./Flex";
import styles from "./ScrollToTop.module.scss";

interface ScrollToTopProps extends React.ComponentProps<typeof Flex> {
  offset?: number;
}

export const ScrollToTop = ({ children, offset = 300, className, ...rest }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Reads `offset` fresh (it was captured once at mount), and checks on mount
  // too, so a page restored halfway down shows the button before any scroll.
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > offset);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);

  // It takes focus, so it has to be a button a keyboard can press: it was a
  // focusable div that only answered to a click.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToTop();
    }
  };

  return (
    <Flex
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      role="button"
      aria-hidden={!isVisible}
      position="fixed"
      bottom="16"
      right="16"
      className={classNames(styles.scrollToTop, className)}
      data-visible={isVisible}
      tabIndex={isVisible ? 0 : -1}
      zIndex={isVisible ? 8 : 0}
      cursor="pointer"
      {...rest}
    >
      {children}
    </Flex>
  );
};

ScrollToTop.displayName = "ScrollToTop";

"use client";

import { type ComponentProps, forwardRef, useCallback, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";

export interface ScrollToTopProps extends ComponentProps<typeof Flex> {
  offset?: number;
}

const ScrollToTop = forwardRef<HTMLDivElement, ScrollToTopProps>(
  ({ children, offset = 300, className, ...rest }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleScroll = useCallback(() => {
      setIsVisible(window.scrollY > offset);
    }, [offset]);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    useEffect(() => {
      handleScroll();
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
      <Flex
        ref={ref}
        onClick={scrollToTop}
        aria-hidden={!isVisible}
        position="fixed"
        bottom="16"
        right="16"
        className={cn(
          "transition-all duration-200 ease-in-out",
          isVisible
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none",
          className,
        )}
        data-visible={isVisible}
        tabIndex={isVisible ? 0 : -1}
        zIndex={isVisible ? 8 : 0}
        cursor="pointer"
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

ScrollToTop.displayName = "ScrollToTop";

export { ScrollToTop };

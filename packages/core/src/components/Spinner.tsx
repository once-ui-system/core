import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { TShirtSizes } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";

export const spinnerVariants = cva("relative inline-flex items-center justify-center", {
  variants: {
    size: {
      xs: "w-16 h-16 p-2",
      s: "w-20 h-20 p-2",
      m: "w-24 h-24 p-[3px]",
      l: "w-32 h-32 p-4",
      xl: "w-40 h-40 p-8",
    },
  },
  defaultVariants: {
    size: "m",
  },
});

export interface SpinnerProps extends FlexComponentProps {
  size?: TShirtSizes;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "m", ariaLabel = "Loading", className, style, ...rest }, ref) => {
    const borderWidth = size === "l" || size === "xl" ? "border-[3px]" : "border-2";

    return (
      <Flex center style={style} className={className} {...rest}>
        <Flex
          ref={ref}
          center
          className={spinnerVariants({ size })}
          role="status"
          aria-label={ariaLabel}
        >
          <Flex fill position="relative">
            <Flex
              fill
              radius="full"
              borderStyle="solid"
              border="neutral-alpha-medium"
              position="absolute"
              className={borderWidth}
            />
            <Flex
              fill
              radius="full"
              borderStyle="solid"
              className={cn("animate-spin border-transparent !border-t-current", borderWidth)}
            />
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner };

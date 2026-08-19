"use client";

import { cva } from "class-variance-authority";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { ElementType } from "./ElementType";
import { Row } from "./Row";
import { Text } from "./Text";

export const optionVariants = cva(
  "relative w-full border border-solid border-transparent transition-colors duration-micro-medium select-none outline-none text-neutral-on-background-strong hover:bg-neutral-alpha-weak hover:border-neutral-alpha-medium focus:bg-neutral-alpha-weak focus:border-neutral-alpha-medium focus:outline-none",
  {
    variants: {
      danger: {
        true: "text-danger-on-background-medium hover:bg-danger-solid-strong hover:text-danger-on-solid-strong hover:border-danger-border-strong focus:bg-danger-solid-strong focus:text-danger-on-solid-strong focus:border-danger-border-strong",
        false: "",
      },
      selected: {
        true: "bg-neutral-alpha-medium border-neutral-alpha-medium",
        false: "",
      },
      highlighted: {
        true: "bg-transparent border-neutral-alpha-medium",
        false: "",
      },
      disabled: {
        true: "bg-neutral-alpha-weak text-neutral-on-background-weak border-transparent cursor-not-allowed pointer-events-none hover:bg-neutral-alpha-weak hover:border-transparent hover:text-neutral-on-background-weak focus:bg-neutral-alpha-weak focus:border-transparent",
        false: "",
      },
    },
    compoundVariants: [
      {
        selected: true,
        danger: true,
        className: "bg-danger-alpha-medium border-danger-alpha-medium",
      },
    ],
    defaultVariants: {
      danger: false,
      selected: false,
      highlighted: false,
      disabled: false,
    },
  },
);

export interface OptionProps extends Omit<ComponentProps<typeof Row>, "onClick"> {
  label?: ReactNode;
  href?: string;
  value: string;
  hasPrefix?: ReactNode;
  hasSuffix?: ReactNode;
  description?: ReactNode;
  danger?: boolean;
  selected?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  tabIndex?: number;
  children?: ReactNode;
  onClick?: (value: string) => void;
  onLinkClick?: () => void;
}

const Option = forwardRef<HTMLDivElement, OptionProps>(
  (
    {
      label,
      value,
      href,
      hasPrefix,
      hasSuffix,
      description,
      danger,
      selected,
      disabled = false,
      highlighted,
      tabIndex,
      onClick,
      onLinkClick,
      children,
      className,
      ...flex
    },
    ref,
  ) => {
    // Track if the element has the highlighted class applied by ArrowNavigation
    const [isHighlightedByClass, setIsHighlightedByClass] = useState(false);
    // Use a more generic type that works with ElementType
    const elementRef = useRef<HTMLElement>(null);

    // Check for highlighted class applied by ArrowNavigation
    useEffect(() => {
      if (!elementRef.current) return;

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "attributes" &&
            (mutation.attributeName === "class" || mutation.attributeName === "data-highlighted")
          ) {
            if (mutation.target instanceof HTMLElement) {
              const element = mutation.target;
              const hasHighlighted =
                element.classList.contains("highlighted") ||
                element.getAttribute("data-highlighted") === "true";

              // If highlighted class was just added but element is being hovered, remove it immediately
              if (hasHighlighted && element.matches(":hover")) {
                element.classList.remove("highlighted");
                element.removeAttribute("data-highlighted");
                setIsHighlightedByClass(false);
              } else {
                setIsHighlightedByClass(hasHighlighted);
              }
            }
          }
        }
      });

      observer.observe(elementRef.current, {
        attributes: true,
        attributeFilter: ["class", "data-highlighted"],
      });

      // Initial check
      const hasHighlighted =
        elementRef.current.classList.contains("highlighted") ||
        elementRef.current.getAttribute("data-highlighted") === "true";

      // Check if element is being hovered on initial check too
      if (hasHighlighted && elementRef.current.matches(":hover")) {
        elementRef.current.classList.remove("highlighted");
        elementRef.current.removeAttribute("data-highlighted");
        setIsHighlightedByClass(false);
      } else {
        setIsHighlightedByClass(hasHighlighted);
      }

      return () => observer.disconnect();
    }, []);

    // Sync hover state with keyboard navigation by removing highlight from ALL options including self
    const handleMouseEnter = () => {
      if (!disabled) {
        // Remove highlighted class from ALL options (including self) to let CSS :hover take over
        if (elementRef.current?.parentElement) {
          const allOptions = elementRef.current.parentElement.querySelectorAll('[role="option"]');
          for (const option of allOptions) {
            option.classList.remove("highlighted");
            option.removeAttribute("data-highlighted");
          }
        }
      }
    };

    return (
      <ElementType
        tabIndex={tabIndex}
        ref={(el) => {
          // Forward the ref
          if (typeof ref === "function") {
            ref(el as HTMLDivElement);
          } else if (ref) {
            ref.current = el as HTMLDivElement;
          }
          // Store our own ref
          elementRef.current = el;
        }}
        href={href}
        disabled={disabled}
        data-disabled={disabled ? true : undefined}
        data-value={value}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        className="reset-button-styles w-full text-left bg-transparent border-0 p-0 m-0 cursor-pointer block focus:outline-none"
        onLinkClick={onLinkClick}
        onClick={() => onClick?.(value)}
        onMouseEnter={handleMouseEnter}
        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            e.stopPropagation();
            elementRef.current?.click();
          }
        }}
      >
        <Row
          fillWidth
          vertical="center"
          paddingX="12"
          paddingY="8"
          gap="12"
          radius="m"
          tabIndex={-1}
          borderWidth={1}
          borderStyle="solid"
          cursor={disabled ? "not-allowed" : "interactive"}
          transition="micro-medium"
          onBackground={danger ? "danger-medium" : "neutral-strong"}
          className={cn(
            optionVariants({
              danger: Boolean(danger),
              selected: Boolean(selected),
              highlighted: Boolean(highlighted || isHighlightedByClass),
              disabled: Boolean(disabled),
            }),
            (highlighted || isHighlightedByClass) && "highlighted",
            selected && "selected",
            danger && "danger",
            disabled && "disabled",
            className,
          )}
          {...flex}
        >
          {hasPrefix && <Row vertical="center">{hasPrefix}</Row>}
          <Column fillWidth align="left">
            <Text
              onBackground={danger ? "danger-medium" : "neutral-strong"}
              variant="label-default-s"
              truncate
            >
              {label || children}
            </Text>
            {description && (
              <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                {description}
              </Text>
            )}
          </Column>
          {hasSuffix && <Row vertical="center">{hasSuffix}</Row>}
        </Row>
      </ElementType>
    );
  },
);

Option.displayName = "Option";

export { Option };

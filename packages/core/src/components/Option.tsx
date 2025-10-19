"use client";

import classNames from "classnames";
import { Text, ElementType, Column, Row } from ".";
import styles from "./Option.module.scss";
import React, { forwardRef, KeyboardEvent, useRef, useEffect, useState } from "react";

export interface OptionProps extends Omit<React.ComponentProps<typeof Row>, "onClick"> {
  label?: React.ReactNode;
  href?: string;
  value: string;
  hasPrefix?: React.ReactNode;
  hasSuffix?: React.ReactNode;
  description?: React.ReactNode;
  danger?: boolean;
  selected?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  tabIndex?: number;
  children?: React.ReactNode;
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
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            (mutation.attributeName === "class" || mutation.attributeName === "data-highlighted")
          ) {
            if (mutation.target instanceof HTMLElement) {
              const element = mutation.target;
              const hasHighlighted = element.classList.contains("highlighted") ||
                element.getAttribute("data-highlighted") === "true";
              
              // If highlighted class was just added but element is being hovered, remove it immediately
              if (hasHighlighted && element.matches(':hover')) {
                element.classList.remove('highlighted');
                element.removeAttribute('data-highlighted');
                setIsHighlightedByClass(false);
              } else {
                setIsHighlightedByClass(hasHighlighted);
              }
            }
          }
        });
      });

      observer.observe(elementRef.current, {
        attributes: true,
        attributeFilter: ["class", "data-highlighted"],
      });

      // Initial check
      const hasHighlighted = elementRef.current.classList.contains("highlighted") ||
        elementRef.current.getAttribute("data-highlighted") === "true";
      
      // Check if element is being hovered on initial check too
      if (hasHighlighted && elementRef.current.matches(':hover')) {
        elementRef.current.classList.remove('highlighted');
        elementRef.current.removeAttribute('data-highlighted');
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
          allOptions.forEach((option) => {
            option.classList.remove('highlighted');
            option.removeAttribute('data-highlighted');
          });
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
        className="reset-button-styles fill-width"
        onLinkClick={onLinkClick}
        onClick={() => onClick?.(value)}
        onMouseEnter={handleMouseEnter}
        data-value={value}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
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
          onBackground="neutral-strong"
          className={classNames(styles.option, {
            [styles.danger]: danger,
            [styles.selected]: selected,
            [styles.highlighted]: highlighted || isHighlightedByClass,
            [styles.disabled]: disabled,
          })}
          {...flex}
        >
          {hasPrefix && <Row className={styles.prefix}>{hasPrefix}</Row>}
          <Column
            horizontal="start"
            style={{
              whiteSpace: "nowrap",
            }}
            fillWidth
          >
            <Text onBackground="neutral-strong" variant="label-default-s">
              {label || children}
            </Text>
            {description && (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {description}
              </Text>
            )}
          </Column>
          {hasSuffix && <Row className={styles.suffix}>{hasSuffix}</Row>}
        </Row>
      </ElementType>
    );
  },
);

Option.displayName = "Option";
export { Option };

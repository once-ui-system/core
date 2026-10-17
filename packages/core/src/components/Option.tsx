"use client";

import classNames from "clsx";
import React, { forwardRef, KeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { Column } from "./Column";
import { ElementType } from "./ElementType";
import styles from "./Option.module.scss";
import { OptionRoleContext } from "./OptionRoleContext";
import { Row } from "./Row";
import { Text } from "./Text";

export interface OptionProps extends Omit<React.ComponentProps<typeof Row>, "onClick" | "prefix"> {
  label?: React.ReactNode;
  href?: string;
  value: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
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
      prefix,
      suffix,
      description,
      danger,
      selected,
      disabled = false,
      highlighted,
      tabIndex,
      onClick,
      onLinkClick,
      children,
      // These describe the option, so they go on the role="option" element
      // rather than the surface inside it: `aria-activedescendant` has to
      // point at the option, and a combobox marks its active option selected
      // without giving it the chosen-value look that `selected` draws.
      id,
      "aria-selected": ariaSelected,
      ...flex
    },
    ref,
  ) => {
    // Track if the element has the highlighted class applied by ArrowNavigation
    const [isHighlightedByClass, setIsHighlightedByClass] = useState(false);
    // Use a more generic type that works with ElementType
    const elementRef = useRef<HTMLElement>(null);
    // "menuitem" inside a ContextMenu, "option" everywhere else.
    const role = useContext(OptionRoleContext);

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
        });
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
        if (role !== "none" && elementRef.current?.parentElement) {
          const allOptions = elementRef.current.parentElement.querySelectorAll(`[role="${role}"]`);
          allOptions.forEach((option) => {
            option.classList.remove("highlighted");
            option.removeAttribute("data-highlighted");
          });
        }
      }
    };

    return (
      <ElementType
        id={id}
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
        aria-selected={ariaSelected ?? selected}
        aria-disabled={disabled}
        // In a menu: a menu item, which cannot carry aria-selected.
        {...(role === "menuitem" && { role, "aria-selected": undefined })}
        // In a list of links: the element's own role, a link or a button.
        {...(role === "none" && { role: undefined, "aria-selected": undefined })}
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
          {prefix && <Row className={styles.prefix}>{prefix}</Row>}
          <Column fillWidth align="left">
            <Text onBackground="neutral-strong" textVariant="label-default-s" truncate>
              {label || children}
            </Text>
            {description && (
              <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
                {description}
              </Text>
            )}
          </Column>
          {suffix && <Row className={styles.suffix}>{suffix}</Row>}
        </Row>
      </ElementType>
    );
  },
);

Option.displayName = "Option";

export { Option };

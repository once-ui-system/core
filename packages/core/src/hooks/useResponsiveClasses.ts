"use client";

import { useCallback, useEffect } from "react";
import React, { useRef } from "react";

// Helper function to get all possible class names for a property
const getPropertyClassNames = (property: string): string[] => {
  const classNames: string[] = [];

  switch (property) {
    case "position":
      classNames.push("position-static", "position-relative", "position-absolute", "position-fixed", "position-sticky");
      break;
    case "direction":
      classNames.push("flex-row", "flex-row-reverse", "flex-column", "flex-column-reverse");
      break;
    case "horizontal":
      classNames.push("justify-start", "justify-end", "justify-center", "justify-between", "justify-around", "justify-evenly", "align-start", "align-end", "align-center", "align-stretch");
      break;
    case "vertical":
      classNames.push("justify-start", "justify-end", "justify-center", "justify-between", "justify-around", "justify-evenly", "align-start", "align-end", "align-center", "align-stretch");
      break;
    case "overflow":
      classNames.push("overflow-visible", "overflow-hidden", "overflow-scroll", "overflow-auto");
      break;
    case "overflowX":
      classNames.push("overflow-x-visible", "overflow-x-hidden", "overflow-x-scroll", "overflow-x-auto");
      break;
    case "overflowY":
      classNames.push("overflow-y-visible", "overflow-y-hidden", "overflow-y-scroll", "overflow-y-auto");
      break;
    case "columns":
      // Generate common column numbers
      for (let i = 1; i <= 12; i++) {
        classNames.push(`columns-${i}`);
      }
      break;
    case "flex":
        // Generate common flex classes
        for (let i = 1; i <= 12; i++) {
            classNames.push(`flex-${i}`);
        }
      break;
    case "wrap":
      classNames.push("flex-wrap", "flex-nowrap", "flex-wrap-reverse");
      break;
    case "hide":
      classNames.push("flex-hide", "flex-show");
      break;
    case "top":
      classNames.push("top-0", "top-1", "top-2", "top-4", "top-8", "top-12", "top-16", "top-20", "top-24", "top-32", "top-40", "top-48", "top-56", "top-64", "top-80", "top-104", "top-128", "top-160");
      break;
    case "right":
        classNames.push("right-0", "right-1", "right-2", "right-4", "right-8", "right-12", "right-16", "right-20", "right-24", "right-32", "right-40", "right-48", "right-56", "right-64", "right-80", "right-104", "right-128", "right-160");
      break;
    case "bottom":
      classNames.push("bottom-0", "bottom-1", "bottom-2", "bottom-4", "bottom-8", "bottom-12", "bottom-16", "bottom-20", "bottom-24", "bottom-32", "bottom-40", "bottom-48", "bottom-56", "bottom-64", "bottom-80", "bottom-104", "bottom-128", "bottom-160");
      break;
    case "left":
      classNames.push("left-0", "left-1", "left-2", "left-4", "left-8", "left-12", "left-16", "left-20", "left-24", "left-32", "left-40", "left-48", "left-56", "left-64", "left-80", "left-104", "left-128", "left-160");
      break;
  }

  return classNames;
};

export const useResponsiveClasses = (
  elementRef: React.RefObject<HTMLDivElement | null>,
  responsiveProps: { xl?: any; l?: any; m?: any; s?: any; xs?: any },
  currentBreakpoint: string,
) => {
  if (!elementRef) {
    return;
  }
  const appliedClasses = useRef<Set<string>>(new Set());
  const originalClasses = useRef<string[]>([]);
  const isInitialized = useRef(false);

  const applyResponsiveClasses = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Store original classes on first run
    if (!isInitialized.current) {
      originalClasses.current = Array.from(element.classList);
      isInitialized.current = true;
    }

    // Remove all previously applied responsive classes
    appliedClasses.current.forEach((className) => {
      element.classList.remove(className);
    });
    appliedClasses.current.clear();

    // Helper function to get value with cascading fallback
    const getValueWithCascading = (property: string) => {
      const { xl, l, m, s, xs } = responsiveProps;

      switch (currentBreakpoint) {
        case "xl":
          return xl?.[property];
        case "l":
          return l?.[property] !== undefined ? l[property] : xl?.[property];
        case "m":
          return m?.[property] !== undefined
            ? m[property]
            : l?.[property] !== undefined
              ? l[property]
              : xl?.[property];
        case "s":
          return s?.[property] !== undefined
            ? s[property]
            : m?.[property] !== undefined
              ? m[property]
              : l?.[property] !== undefined
                ? l[property]
                : xl?.[property];
        case "xs":
          return xs?.[property] !== undefined
            ? xs[property]
            : s?.[property] !== undefined
              ? s[property]
              : m?.[property] !== undefined
                ? m[property]
                : l?.[property] !== undefined
                  ? l[property]
                  : xl?.[property];
        default:
          return undefined;
      }
    };

    // Properties to check for responsive classes
    const properties = [
      "position",
      "direction",
      "horizontal",
      "vertical",
      // Display properties
      "overflow",
      "overflowX",
      "overflowY",
      // Grid properties
      "columns",
      // Flex properties
      "flex",
      "wrap",
      "show",
      "hide",
      // Position offsets
      "top",
      "right",
      "bottom",
      "left",
    ];

    properties.forEach((property) => {
      const value = getValueWithCascading(property);

      if (value !== undefined) {
        // Remove all possible classes for this property
        const possibleClasses = getPropertyClassNames(property);
        possibleClasses.forEach((possibleClass) => {
          if (element.classList.contains(possibleClass)) {
            element.classList.remove(possibleClass);
          }
        });

        let className = "";

        switch (property) {
          case "position":
            className = `position-${value}`;
            break;
          case "direction":
            className = `flex-${value}`;
            break;
          case "horizontal":
            // Determine if it should be justify or align based on direction
            const direction = getValueWithCascading("direction");
            const isRowDirection = !direction || direction === "row" || direction === "row-reverse";
            className = isRowDirection ? `justify-${value}` : `align-${value}`;
            break;
          case "vertical":
            // Determine if it should be justify or align based on direction
            const verticalDirection = getValueWithCascading("direction");
            const isVerticalRowDirection =
              !verticalDirection ||
              verticalDirection === "row" ||
              verticalDirection === "row-reverse";
            className = isVerticalRowDirection ? `align-${value}` : `justify-${value}`;
            break;
          // Display properties
          case "overflow":
            className = `overflow-${value}`;
            break;
          case "overflowX":
            className = `overflow-x-${value}`;
            break;
          case "overflowY":
            className = `overflow-y-${value}`;
            break;
          // Grid properties
          case "columns":
            className = `columns-${value}`;
            break;
          // Flex properties
          case "flex":
            className = `flex-${value}`;
            break;
          case "wrap":
            className = `flex-${value}`;
            break;
          case "hide":
            className = value ? "flex-hide" : "flex-show";
            break;
          // Position offsets
          case "top":
            className = `top-${value}`;
            break;
          case "right":
            className = `right-${value}`;
            break;
          case "bottom":
            className = `bottom-${value}`;
            break;
          case "left":
            className = `left-${value}`;
            break;
        }

        if (className) {
          element.classList.add(className);
          appliedClasses.current.add(className);
        }
      } else {
        // If value is undefined, restore original classes for this property
        const possibleClasses = getPropertyClassNames(property);
        const originalClassesToRestore = originalClasses.current.filter(originalClass =>
          possibleClasses.includes(originalClass)
        );

        // First remove all possible classes for this property
        possibleClasses.forEach((possibleClass) => {
          if (element.classList.contains(possibleClass)) {
            element.classList.remove(possibleClass);
          }
        });

        // Then restore original classes for this property
        originalClassesToRestore.forEach((originalClass) => {
          if (!element.classList.contains(originalClass)) {
            element.classList.add(originalClass);
          }
        });
      }
    });
  }, [responsiveProps, currentBreakpoint]);

  useEffect(() => {
    applyResponsiveClasses();
  }, [applyResponsiveClasses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        appliedClasses.current.forEach((className) => {
          elementRef.current?.classList.remove(className);
        });
      }
    };
  }, []);
};

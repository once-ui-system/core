"use client";

import { useCallback, useEffect } from "react";
import React, { useRef } from "react";

export const useResponsiveClasses = (
  elementRef: React.RefObject<HTMLDivElement | null>,
  responsiveProps: { xl?: any; l?: any; m?: any; s?: any; xs?: any },
  currentBreakpoint: string,
) => {
  if (!elementRef) {
    return;
  }
  const appliedClasses = useRef<Set<string>>(new Set());

  const applyResponsiveClasses = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

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

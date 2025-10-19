"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Default breakpoints
export const DEFAULT_BREAKPOINTS = {
  xs: 480, // Extra small (mobile small)
  s: 768, // Small (mobile)
  m: 1024, // Medium (tablet)
  l: 1440, // Large (desktop)
  xl: Infinity, // Above all breakpoints
} as const;

export type BreakpointKey = keyof typeof DEFAULT_BREAKPOINTS;
export type Breakpoints = Record<BreakpointKey, number>;

interface LayoutContextType {
  currentBreakpoint: BreakpointKey;
  width: number;
  breakpoints: Breakpoints;
  isDefaultBreakpoints: () => boolean;
  isBreakpoint: (key: BreakpointKey) => boolean;
  maxWidth: (key: BreakpointKey) => boolean;
  minWidth: (key: BreakpointKey) => boolean;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

interface LayoutProviderProps {
  children: ReactNode;
  breakpoints?: Partial<Breakpoints>;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  breakpoints: customBreakpoints,
}) => {
  // Merge custom breakpoints with defaults
  const breakpoints: Breakpoints = {
  ...DEFAULT_BREAKPOINTS,
    ...customBreakpoints,
  };

  const [width, setWidth] = useState<number>(0);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>("l");

  // Determine current breakpoint based on width
  const getCurrentBreakpoint = (width: number): BreakpointKey => {
    if (width <= breakpoints.xs) return "xs";
    if (width <= breakpoints.s) return "s";
    if (width <= breakpoints.m) return "m";
    if (width <= breakpoints.l) return "l";
    return "xl";
  };

  // Check if current breakpoint matches the given key
  const isBreakpoint = (key: BreakpointKey): boolean => {
    return currentBreakpoint === key;
  };

  // Check if current width is at or below the given breakpoint (max-width)
  const maxWidth = (key: BreakpointKey): boolean => {
    return width <= breakpoints[key];
  };

  // Check if current width is above the given breakpoint (min-width)
  const minWidth = (key: BreakpointKey): boolean => {
    return width > breakpoints[key];
  };

  const isDefaultBreakpoints = (): boolean => {
    return JSON.stringify(breakpoints) === JSON.stringify(DEFAULT_BREAKPOINTS);
  };

  useEffect(() => {
    // Update CSS custom properties (Not usable because of media queries)
    // This part is commented out because CSS custom properties cannot be used with media queries in this
    //const root = document.documentElement;
    //Object.entries(breakpoints).forEach(([key, value]) => {
    //    if (value !== Infinity) {
    //        root.style.setProperty(`--breakpoint-${key}`, `${value}px`);
    //    }
    //});

    // Initialize width
    const updateWidth = () => {
      const newWidth = window.innerWidth;
      const newBreakpoint = getCurrentBreakpoint(newWidth);
      
      // Only update state if breakpoint actually changed
      setWidth(newWidth);
      setCurrentBreakpoint((prev) => {
        if (prev !== newBreakpoint) {
          return newBreakpoint;
        }
        return prev;
      });
    };

    // Debounce resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdateWidth = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 100);
    };

    // Set initial width
    updateWidth();

    // Add resize listener with debouncing
    window.addEventListener("resize", debouncedUpdateWidth);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedUpdateWidth);
    };
  }, [breakpoints]);

  const value: LayoutContextType = {
    currentBreakpoint,
    width,
    breakpoints,
    isDefaultBreakpoints,
    isBreakpoint,
    maxWidth,
    minWidth,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

export { LayoutProvider };

"use client";

import React, { createContext, useContext, useRef, ReactNode, useEffect } from "react";
import { useArrowNavigation, ArrowNavigationOptions } from "../hooks/useArrowNavigation";
import { FocusTrap } from "./FocusTrap";

interface ArrowNavigationContextType {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  applyHighlightedState: () => void;
}

const ArrowNavigationContext = createContext<ArrowNavigationContextType | null>(null);

export interface ArrowNavigationProps extends Omit<ArrowNavigationOptions, "containerRef"> {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
  trapFocus?: boolean;
  focusTrapActive?: boolean;
  onEscape?: () => void;
  autoFocusTrap?: boolean;
  restoreFocus?: boolean;
}

export const ArrowNavigation: React.FC<ArrowNavigationProps> = ({
  layout,
  itemCount,
  columns,
  onSelect,
  onFocusChange,
  wrap,
  initialFocusedIndex,
  itemSelector,
  autoFocus,
  disabled,
  children,
  className,
  style,
  role,
  "aria-label": ariaLabel,
  trapFocus = false,
  focusTrapActive = true,
  onEscape,
  autoFocusTrap = true,
  restoreFocus = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const navigation = useArrowNavigation({
    layout,
    itemCount,
    columns,
    containerRef,
    onSelect,
    onFocusChange,
    wrap,
    initialFocusedIndex,
    itemSelector,
    autoFocus,
    disabled,
  });

  // Focus the container when autoFocus is enabled
  useEffect(() => {
    if (autoFocus && containerRef.current && !disabled) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.focus();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  // Determine the appropriate role based on layout if not provided
  const defaultRole = layout === "grid" ? "grid" : "listbox";

  // Create the navigation container
  const navigationContainer = (
    <div
      ref={containerRef}
      className={className}
      style={{ ...style, outline: "none" }}
      onKeyDown={(e) => {
        navigation.handleKeyDown(e);
      }}
      role={role || defaultRole}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {children}
    </div>
  );

  return (
    <ArrowNavigationContext.Provider value={navigation}>
      {trapFocus ? (
        <FocusTrap
          active={focusTrapActive}
          onEscape={onEscape}
          autoFocus={autoFocusTrap}
          restoreFocus={restoreFocus}
        >
          {navigationContainer}
        </FocusTrap>
      ) : (
        navigationContainer
      )}
    </ArrowNavigationContext.Provider>
  );
};

/**
 * Hook to access the ArrowNavigation context
 */
export const useArrowNavigationContext = () => {
  const context = useContext(ArrowNavigationContext);
  if (!context) {
    throw new Error("useArrowNavigationContext must be used within an ArrowNavigation component");
  }
  return context;
};

/**
 * Higher-order component to make a component navigable with arrow keys
 */
export function withArrowNavigation<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ArrowNavigationProps, "children">,
): React.FC<P & { children?: ReactNode }> {
  return ({ children, ...props }) => (
    <ArrowNavigation {...options}>
      <Component {...(props as P)}>{children}</Component>
    </ArrowNavigation>
  );
}

export default ArrowNavigation;

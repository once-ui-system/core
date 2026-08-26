"use client";

import type { ComponentType, CSSProperties, FC, KeyboardEvent, ReactNode } from "react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "../classes/utils";
import type { ArrowNavigationOptions } from "../hooks/useArrowNavigation";
import { useArrowNavigation } from "../hooks/useArrowNavigation";
import { Column, type ColumnProps } from "./Column";
import { FocusTrap } from "./FocusTrap";

export interface ArrowNavigationContextType {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  applyHighlightedState: () => void;
}

const ArrowNavigationContext = createContext<ArrowNavigationContextType | null>(null);

export interface ArrowNavigationProps
  extends Omit<ArrowNavigationOptions, "containerRef">,
    Omit<ColumnProps, "onSelect" | "wrap"> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  role?: string;
  "aria-label"?: string;
  trapFocus?: boolean;
  focusTrapActive?: boolean;
  onEscape?: () => void;
  autoFocusTrap?: boolean;
  restoreFocus?: boolean;
}

const ArrowNavigation = forwardRef<HTMLDivElement, ArrowNavigationProps>(
  (
    {
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
      disableHighlighting,
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
      ...rest
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

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
      disableHighlighting,
    });

    // Focus the container when autoFocus is enabled
    useEffect(() => {
      if (autoFocus && containerRef.current && !disabled) {
        // Small delay to ensure the component is fully mounted
        const timer = setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.focus({ preventScroll: true });
          }
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [autoFocus, disabled]);

    // Determine the appropriate role based on layout if not provided
    const defaultRole = layout === "grid" ? "grid" : "listbox";

    // Create the navigation container
    const navigationContainer = (
      <Column
        ref={containerRef}
        className={cn("max-h-full outline-none", className)}
        style={style}
        onKeyDown={(e) => {
          navigation.handleKeyDown(e);
        }}
        role={role || defaultRole}
        aria-label={ariaLabel}
        tabIndex={-1}
        {...rest}
      >
        {children}
      </Column>
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
  },
);

ArrowNavigation.displayName = "ArrowNavigation";

export { ArrowNavigation };

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
  Component: ComponentType<P>,
  options: Omit<ArrowNavigationProps, "children">,
): FC<P & { children?: ReactNode }> {
  return ({ children, ...props }) => (
    <ArrowNavigation {...options}>
      <Component {...(props as P)}>{children}</Component>
    </ArrowNavigation>
  );
}

export default ArrowNavigation;

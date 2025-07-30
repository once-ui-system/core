import React, { forwardRef } from "react";
import { ClientFlex, ServerFlex } from ".";
import { FlexProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps } from "../interfaces";
import { useLayout } from "../contexts/LayoutContext";

interface SmartFlexProps extends FlexProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps {}

const Flex = forwardRef<HTMLDivElement, SmartFlexProps>(({ cursor, l, m, s, style, hide, ...props }, ref) => {
  // Check if component should be hidden based on layout context
  const shouldHide = () => {
    if (!hide && !l?.hide && !m?.hide && !s?.hide) return false;
    
    try {
      const { isBreakpoint } = useLayout();
      const currentBreakpoint = isBreakpoint('s') ? 's' : isBreakpoint('m') ? 'm' : 'l';
      
      // Max-width CSS-like behavior: check from largest to smallest breakpoint
      // The first hide=true we find applies to current breakpoint and all smaller breakpoints
      
      // Check large breakpoint first (applies to large and below)
      if (l?.hide !== undefined && (currentBreakpoint === 'l' || currentBreakpoint === 'm' || currentBreakpoint === 's')) {
        return l.hide;
      }
      
      // Check medium breakpoint (applies to medium and below)
      if (m?.hide !== undefined && (currentBreakpoint === 'm' || currentBreakpoint === 's')) {
        return m.hide;
      }
      
      // Check small breakpoint (applies to small only)
      if (s?.hide !== undefined && currentBreakpoint === 's') {
        return s.hide;
      }
      
      // If no responsive hide prop applies, use the default hide prop
      return hide || false;
    } catch {
      // If LayoutProvider is not available, fall back to CSS classes
      return false;
    }
  };

  // Check if we need client-side functionality
  const needsClientSide = () => {
    // Custom cursor requires client-side
    if (typeof cursor === 'object' && cursor) return true;
    
    // Responsive props require client-side
    if (l || m || s) return true;
    
    // Dynamic styles require client-side
    if (style && typeof style === 'object' && Object.keys(style as Record<string, any>).length > 0) return true;
    
    return false;
  };

  // If component should be hidden, don't render it
  if (shouldHide()) {
    return null;
  }

  // Use client component if any client-side functionality is needed
  if (needsClientSide()) {
    return <ClientFlex ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} hide={hide} {...props} />;
  }
  
  // Use server component for static content
  return <ServerFlex ref={ref} cursor={cursor} hide={hide} {...props} />;
});

Flex.displayName = "Flex";
export { Flex };

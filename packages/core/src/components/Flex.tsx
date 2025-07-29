import React, { forwardRef } from "react";
import { ClientFlex, ServerFlex } from ".";
import { FlexProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps } from "../interfaces";
import { useLayout } from "../contexts/LayoutContext";

interface SmartFlexProps extends FlexProps, StyleProps, SpacingProps, SizeProps, CommonProps, DisplayProps {}

const Flex = forwardRef<HTMLDivElement, SmartFlexProps>(({ cursor, l, m, s, style, hide, show, ...props }, ref) => {
  // Check if component should be hidden based on layout context
  const shouldHide = () => {
    if (!hide && !show && !l?.hide && !m?.hide && !s?.hide && !l?.show && !m?.show && !s?.show) return false;
    
    try {
      const { isBreakpoint } = useLayout();
      
      // Check direct hide conditions
      if (hide) {
        if (typeof hide === 'boolean' && hide) return true;
        if (typeof hide === 'object' && hide.s && isBreakpoint('s')) return true;
        if (typeof hide === 'object' && hide.m && isBreakpoint('m')) return true;
        if (typeof hide === 'object' && hide.l && isBreakpoint('l')) return true;
      }
      
      // Check hide conditions in responsive props
      if (s?.hide) {
        if (typeof s.hide === 'boolean' && s.hide && isBreakpoint('s')) return true;
        if (typeof s.hide === 'object' && s.hide.s && isBreakpoint('s')) return true;
        if (typeof s.hide === 'object' && s.hide.m && isBreakpoint('m')) return true;
        if (typeof s.hide === 'object' && s.hide.l && isBreakpoint('l')) return true;
      }
      
      if (m?.hide) {
        if (typeof m.hide === 'boolean' && m.hide && isBreakpoint('m')) return true;
        if (typeof m.hide === 'object' && m.hide.s && isBreakpoint('s')) return true;
        if (typeof m.hide === 'object' && m.hide.m && isBreakpoint('m')) return true;
        if (typeof m.hide === 'object' && m.hide.l && isBreakpoint('l')) return true;
      }
      
      if (l?.hide) {
        if (typeof l.hide === 'boolean' && l.hide && isBreakpoint('l')) return true;
        if (typeof l.hide === 'object' && l.hide.s && isBreakpoint('s')) return true;
        if (typeof l.hide === 'object' && l.hide.m && isBreakpoint('m')) return true;
        if (typeof l.hide === 'object' && l.hide.l && isBreakpoint('l')) return true;
      }
      
      // Check direct show conditions
      if (show) {
        if (typeof show === 'boolean' && show) return false;
        if (typeof show === 'object' && show.s && isBreakpoint('s')) return false;
        if (typeof show === 'object' && show.m && isBreakpoint('m')) return false;
        if (typeof show === 'object' && show.l && isBreakpoint('l')) return false;
        // If show is specified but current breakpoint doesn't match, hide
        return true;
      }
      
      // Check show conditions in responsive props
      if (s?.show) {
        if (typeof s.show === 'boolean' && s.show && isBreakpoint('s')) return false;
        if (typeof s.show === 'object' && s.show.s && isBreakpoint('s')) return false;
        if (typeof s.show === 'object' && s.show.m && isBreakpoint('m')) return false;
        if (typeof s.show === 'object' && s.show.l && isBreakpoint('l')) return false;
        // If show is specified but current breakpoint doesn't match, hide
        if (isBreakpoint('s')) return true;
      }
      
      if (m?.show) {
        if (typeof m.show === 'boolean' && m.show && isBreakpoint('m')) return false;
        if (typeof m.show === 'object' && m.show.s && isBreakpoint('s')) return false;
        if (typeof m.show === 'object' && m.show.m && isBreakpoint('m')) return false;
        if (typeof m.show === 'object' && m.show.l && isBreakpoint('l')) return false;
        // If show is specified but current breakpoint doesn't match, hide
        if (isBreakpoint('m')) return true;
      }
      
      if (l?.show) {
        if (typeof l.show === 'boolean' && l.show && isBreakpoint('l')) return false;
        if (typeof l.show === 'object' && l.show.s && isBreakpoint('s')) return false;
        if (typeof l.show === 'object' && l.show.m && isBreakpoint('m')) return false;
        if (typeof l.show === 'object' && l.show.l && isBreakpoint('l')) return false;
        // If show is specified but current breakpoint doesn't match, hide
        if (isBreakpoint('l')) return true;
      }
      
      return false;
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
    
    // Responsive hide/show requires client-side
    if (hide && (typeof hide === 'object' && (hide.s || hide.m || hide.l))) return true;
    if (show && (typeof show === 'object' && (show.s || show.m || show.l))) return true;
    
    return false;
  };

  // If component should be hidden, don't render it
  if (shouldHide()) {
    return null;
  }

  // Use client component if any client-side functionality is needed
  if (needsClientSide()) {
    return <ClientFlex ref={ref} cursor={cursor} l={l} m={m} s={s} style={style} hide={hide} show={show} {...props} />;
  }
  
  // Use server component for static content
  return <ServerFlex ref={ref} cursor={cursor} hide={hide} show={show} {...props} />;
});

Flex.displayName = "Flex";
export { Flex };

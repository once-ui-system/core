"use client";

import { forwardRef } from "react";
import { ServerFlex, Cursor } from ".";
import { FlexProps, StyleProps } from "../interfaces";
import { useRef, useEffect, useCallback, CSSProperties, useState } from "react";

interface ClientFlexProps extends FlexProps, StyleProps {
  cursor?: StyleProps["cursor"];
}

export const ClientFlex = forwardRef<HTMLDivElement, ClientFlexProps>(({ cursor, ...props }, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    elementRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
  const appliedResponsiveStyles = useRef<Set<string>>(new Set());
  const baseStyleRef = useRef<CSSProperties>({});

  // Responsive styles logic (client-side only)
  const applyResponsiveStyles = useCallback(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    const width = window.innerWidth;
    
    // Update base styles when style prop changes
    if (props.style) {
      baseStyleRef.current = { ...props.style };
    }
    
    // Determine which responsive props to apply based on breakpoint
    let currentResponsiveProps: any = null;
    if (width <= 1440 && props.l) {
      currentResponsiveProps = props.l;
    } else if (width <= 1024 && props.m) {
      currentResponsiveProps = props.m;
    } else if (width <= 768 && props.s) {
      currentResponsiveProps = props.s;
    }
    
    // Clear only responsive styles, not base styles
    appliedResponsiveStyles.current.forEach(key => {
      (element.style as any)[key] = '';
    });
    appliedResponsiveStyles.current.clear();
    
    // Reapply base styles
    if (baseStyleRef.current) {
      Object.entries(baseStyleRef.current).forEach(([key, value]) => {
        (element.style as any)[key] = value;
      });
    }
    
    // Apply new responsive styles if we have them for current breakpoint
    if (currentResponsiveProps) {
      if (currentResponsiveProps.style) {
        Object.entries(currentResponsiveProps.style).forEach(([key, value]) => {
          (element.style as any)[key] = value;
          appliedResponsiveStyles.current.add(key);
        });
      }
      if (currentResponsiveProps.aspectRatio) {
        element.style.aspectRatio = currentResponsiveProps.aspectRatio;
        appliedResponsiveStyles.current.add('aspect-ratio');
      }
    }
  }, [props.l, props.m, props.s, props.style]);

  useEffect(() => {
    applyResponsiveStyles();
    
    const handleResize = () => {
      applyResponsiveStyles();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [applyResponsiveStyles]);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      setIsTouchDevice(hasTouch && !hasPointer);
    };

    checkTouchDevice();
    
    const mediaQuery = window.matchMedia('(pointer: fine)');
    const handlePointerChange = () => checkTouchDevice();
    
    mediaQuery.addEventListener('change', handlePointerChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handlePointerChange);
    };
  }, []);

  // Determine if we should hide the default cursor
  const shouldHideCursor = typeof cursor === 'object' && cursor && !isTouchDevice;

  return (
    <>
      <ServerFlex 
        {...props} 
        ref={combinedRef}
        style={{
          ...props.style,
          cursor: shouldHideCursor ? 'none' : props.style?.cursor
        }}
      />
      {typeof cursor === 'object' && cursor && !isTouchDevice && (
        <Cursor cursor={cursor} elementRef={elementRef} />
      )}
    </>
  );
});

ClientFlex.displayName = "ClientFlex";
export default ClientFlex; 
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
  CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  shift,
  flip,
  autoUpdate,
  Placement,
} from "@floating-ui/react-dom";
import { Flex } from ".";
import { SpacingToken } from "@/types";

type TriggerType = "hover" | "click" | "manual";

type EasingCurve = 
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "spring"
  | "bounce";

export interface AnimationProps extends React.ComponentProps<typeof Flex> {
  trigger?: ReactNode;
  children: ReactNode;
  fade?: number;
  scale?: number;
  blur?: number;
  slideUp?: number;
  slideDown?: number;
  slideLeft?: number;
  slideRight?: number;
  zoomIn?: number;
  zoomOut?: number;
  triggerType?: TriggerType;
  active?: boolean;
  delay?: number;
  duration?: number;
  easing?: EasingCurve;
  transformOrigin?: string;
  childrenPosition?: CSSProperties["position"];
  reverse?: boolean;
  touch?: "disable" | "enable" | "display";
  // Portal props
  portal?: boolean;
  placement?: Placement;
  offsetDistance?: SpacingToken;
}

const easingCurves: Record<EasingCurve, string> = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

const Animation = forwardRef<HTMLDivElement, AnimationProps>(
  (
    {
      trigger,
      children,
      fade,
      scale,
      blur,
      slideUp,
      slideDown,
      slideLeft,
      slideRight,
      zoomIn,
      zoomOut,
      triggerType = "manual",
      active: controlledActive,
      delay = 0,
      duration = 300,
      easing = "ease-out",
      transformOrigin = "center",
      childrenPosition = "absolute",
      reverse = false,
      touch = "enable",
      portal = false,
      placement = "top",
      offsetDistance = "8",
      ...flex
    },
    ref,
  ) => {
    const [internalActive, setInternalActive] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);
    const [isPositioned, setIsPositioned] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    useEffect(() => {
      setMounted(true);
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
      if (portal) {
        setIsBrowser(true);
      }
    }, [portal]);

    const isControlled = controlledActive !== undefined;
    const rawActive = isControlled ? controlledActive : internalActive;
    
    // Determine if animation should be active based on touch mode
    const isActive = (() => {
      // If on touch device, handle based on touch prop
      if (isTouchDevice && triggerType === "hover") {
        if (touch === 'disable') return false;
        if (touch === 'display') return true;
        // touch === 'enable', fall through to normal logic
      }
      
      // For non-touch or when mounted, use the raw active state
      if (!mounted && !isTouchDevice) return false;
      
      return rawActive;
    })();

    // Floating UI for portal positioning
    const { x, y, strategy, placement: finalPlacement, refs: floatingRefs } = useFloating({
      placement,
      open: isActive,
      middleware: [
        flip(),
        shift(),
      ],
      whileElementsMounted: portal ? autoUpdate : undefined,
    });

    useEffect(() => {
      if (portal && wrapperRef.current) {
        floatingRefs.setReference(wrapperRef.current);
      }
    }, [portal, floatingRefs, mounted]);
    
    useEffect(() => {
      if (portal && isActive && mounted) {
        setIsPositioned(false);
        const timeoutId = setTimeout(() => {
          if (floatingRef.current) {
            floatingRefs.setFloating(floatingRef.current);
            // Mark as positioned after setting the floating element
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setIsPositioned(true);
              });
            });
          }
        }, 0);
        return () => clearTimeout(timeoutId);
      } else {
        setIsPositioned(false);
      }
    }, [portal, isActive, mounted, floatingRefs]);

    const handleMouseEnter = useCallback(() => {
      if (triggerType === "hover") {
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            setInternalActive(true);
          }, delay);
        } else {
          setInternalActive(true);
        }
      }
    }, [triggerType, delay]);

    const handleMouseLeave = useCallback(() => {
      if (triggerType === "hover") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setInternalActive(false);
      }
    }, [triggerType]);

    const handleFocus = useCallback(() => {
      if (triggerType === "hover") {
        handleMouseEnter();
      }
    }, [triggerType, handleMouseEnter]);

    const handleBlur = useCallback(() => {
      if (triggerType === "hover") {
        handleMouseLeave();
      }
    }, [triggerType, handleMouseLeave]);

    const handleClick = useCallback(() => {
      if (triggerType === "click") {
        setIsClicked(!isClicked);
        setInternalActive(!isClicked);
      }
    }, [triggerType, isClicked, setInternalActive]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const getAnimationStyle = (): React.CSSProperties => {
      // For portals, always use center origin for consistent animations
      const calculatedTransformOrigin = portal ? 'center center' : transformOrigin;
      
      // For portals, don't transition position (top/left) - only animate opacity, transform, filter
      const transitionProps = portal 
        ? `opacity ${duration}ms ${easingCurves[easing]}, transform ${duration}ms ${easingCurves[easing]}, filter ${duration}ms ${easingCurves[easing]}`
        : `all ${duration}ms ${easingCurves[easing]}`;
      
      const baseStyle: React.CSSProperties = {
        transition: transitionProps,
        transformOrigin: calculatedTransformOrigin,
      };

      // For portals, animation should trigger based on isPositioned, not isActive
      // For touch="display", wait until mounted to determine state
      const effectiveActive = portal ? isPositioned : (touch === 'display' && !mounted ? false : isActive);
      const shouldAnimate = reverse ? !effectiveActive : effectiveActive;

      // Combine styles from multiple animations
      let combinedStyle: React.CSSProperties = { ...baseStyle };
      const transforms: string[] = [];
      
      if (fade !== undefined) {
        combinedStyle.opacity = shouldAnimate ? 1 : fade;
      }
      
      if (scale !== undefined) {
        transforms.push(shouldAnimate ? "scale(1)" : `scale(${scale})`);
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (blur !== undefined) {
        combinedStyle.filter = shouldAnimate ? "blur(0px)" : `blur(${blur}px)`;
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (slideUp !== undefined) {
        transforms.push(shouldAnimate ? "translateY(0)" : `translateY(${slideUp}rem)`);
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (slideDown !== undefined) {
        transforms.push(shouldAnimate ? "translateY(0)" : `translateY(-${slideDown}rem)`);
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (slideLeft !== undefined) {
        transforms.push(shouldAnimate ? "translateX(0)" : `translateX(${slideLeft}rem)`);
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (slideRight !== undefined) {
        transforms.push(shouldAnimate ? "translateX(0)" : `translateX(-${slideRight}rem)`);
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (zoomIn !== undefined) {
        transforms.push(shouldAnimate ? `scale(${zoomIn})` : "scale(1)");
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }
      
      if (zoomOut !== undefined) {
        transforms.push(shouldAnimate ? `scale(${zoomOut})` : "scale(1)");
        if (combinedStyle.opacity === undefined) {
          combinedStyle.opacity = shouldAnimate ? 1 : 0;
        }
      }

      // Combine all transforms into a single transform property
      if (transforms.length > 0) {
        combinedStyle.transform = transforms.join(" ");
      }

      return combinedStyle;
    };

    const animationStyle = getAnimationStyle();

    // If trigger is provided, wrap it with event handlers
    if (trigger) {
      // Portal mode: render content in portal
      if (portal) {
        return (
          <>
            <Flex
              ref={wrapperRef}
              onMouseEnter={triggerType === "hover" ? handleMouseEnter : undefined}
              onMouseLeave={triggerType === "hover" ? handleMouseLeave : undefined}
              onFocus={triggerType === "hover" ? handleFocus : undefined}
              onBlur={triggerType === "hover" ? handleBlur : undefined}
              onClick={triggerType === "click" ? handleClick : undefined}
            >
              {trigger}
            </Flex>
            {isActive && isBrowser && createPortal(
              <Flex
                ref={floatingRef}
                zIndex={10}
                paddingTop={finalPlacement.includes("bottom") ? offsetDistance : undefined}
                paddingBottom={finalPlacement.includes("top") ? offsetDistance : undefined}
                paddingLeft={finalPlacement.includes("right") ? offsetDistance : undefined}
                paddingRight={finalPlacement.includes("left") ? offsetDistance : undefined}
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                  ...animationStyle,
                  visibility: isPositioned ? 'visible' : 'hidden',
                  pointerEvents: isActive ? "auto" : "none",
                }}
                onMouseEnter={triggerType === "hover" ? handleMouseEnter : undefined}
                onMouseLeave={triggerType === "hover" ? handleMouseLeave : undefined}
                aria-hidden={!isActive}
              >
                {children}
              </Flex>,
              document.body
            )}
          </>
        );
      }
      
      // Normal mode: absolute positioning
      return (
        <Flex
          ref={wrapperRef}
          onMouseLeave={triggerType === "hover" ? handleMouseLeave : undefined}
          {...flex}
        >
          <Flex
            onMouseEnter={triggerType === "hover" ? handleMouseEnter : undefined}
            onFocus={triggerType === "hover" ? handleFocus : undefined}
            onBlur={triggerType === "hover" ? handleBlur : undefined}
            onClick={triggerType === "click" ? handleClick : undefined}
          >
            {trigger}
          </Flex>
          <Flex
            position={childrenPosition}
            style={{
              ...animationStyle,
              pointerEvents: isActive ? "auto" : "none",
            }}
            onMouseEnter={triggerType === "hover" && isActive ? handleMouseEnter : undefined}
            aria-hidden={!isActive}
            inert={!isActive ? true : undefined}
          >
            {children}
          </Flex>
        </Flex>
      );
    }

    // If no trigger, apply animation directly to children
    return (
      <Flex
        ref={wrapperRef}
        onMouseEnter={triggerType === "hover" ? handleMouseEnter : undefined}
        onMouseLeave={triggerType === "hover" ? handleMouseLeave : undefined}
        onFocus={triggerType === "hover" ? handleFocus : undefined}
        onBlur={triggerType === "hover" ? handleBlur : undefined}
        onClick={triggerType === "click" ? handleClick : undefined}
        style={animationStyle}
        {...flex}
      >
        {children}
      </Flex>
    );
  },
);

Animation.displayName = "Animation";
export { Animation };

"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Flex } from ".";

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
  reverse?: boolean;
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
      reverse = false,
      ...flex
    },
    ref,
  ) => {
    const [internalActive, setInternalActive] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    useEffect(() => {
      setMounted(true);
    }, []);

    const isControlled = controlledActive !== undefined;
    const isActive = isControlled ? controlledActive : internalActive;

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
        }
        setInternalActive(false);
      }
    }, [triggerType]);

    const handleClick = useCallback(() => {
      if (triggerType === "click") {
        setIsClicked(!isClicked);
        setInternalActive(!isClicked);
      }
    }, [triggerType, isClicked]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const getAnimationStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        transition: `all ${duration}ms ${easingCurves[easing]}`,
        transformOrigin,
      };

      const shouldAnimate = reverse ? !isActive : isActive;

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
          combinedStyle.opacity = shouldAnimate ? 1 : 0.5;
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
      return (
        <Flex
          ref={wrapperRef}
          onMouseLeave={triggerType === "hover" ? handleMouseLeave : undefined}
          {...flex}
        >
          <Flex
            onMouseEnter={triggerType === "hover" ? handleMouseEnter : undefined}
            onClick={triggerType === "click" ? handleClick : undefined}
          >
            {trigger}
          </Flex>
          <Flex
            position="absolute"
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

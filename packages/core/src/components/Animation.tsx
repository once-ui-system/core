"use client";

import { autoUpdate, flip, shift, useFloating } from "@floating-ui/react-dom";
import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { getFocusableElements } from "../internal/focusable.js";
import { cannotHover } from "../internal/pointer.js";
import type { CSSUnit, Placement, SpacingToken } from "../types.js";
import { tokenLength } from "../utils/layoutClasses.js";
import { Flex } from "./Flex.js";

type TriggerType = "hover" | "click" | "manual";

type EasingCurve = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "spring" | "bounce";

/** A number on the token scale and a CSS length as written, optionally negated. */
const cssLength = (value: number | string, sign: 1 | -1 = 1) =>
  typeof value === "number"
    ? tokenLength(sign * value)
    : sign === 1
      ? value
      : `calc(-1 * ${value})`;

export interface AnimationProps extends React.ComponentProps<typeof Flex> {
  trigger?: ReactNode;
  children: ReactNode;
  fade?: number;
  scale?: number;
  /** Blur to animate from, on the token scale (`8` is 0.5rem). */
  blur?: number;
  /**
   * Distance to slide in from: a number is on the token scale
   * (`16` is 1rem), a string a CSS length.
   */
  slideUp?: number | CSSUnit;
  /** As `slideUp`. */
  slideDown?: number | CSSUnit;
  /** As `slideUp`. */
  slideLeft?: number | CSSUnit;
  /** As `slideUp`. */
  slideRight?: number | CSSUnit;
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

/** Anything in a card a keyboard could act on, rendered yet or not. */
const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

const easingCurves: Record<EasingCurve, string> = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

const Animation = ({
  ref,
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
}: AnimationProps) => {
  const [internalActive, setInternalActive] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardId = useId();
  // Set by a press on the trigger, so the focus that follows is not taken
  // for keyboard focus.
  const pressedRef = useRef(false);
  const handlePress = () => {
    pressedRef.current = true;
  };
  // Whether the card has held something to act on, so the trigger keeps
  // saying it is collapsed once it closes.
  const interactiveRef = useRef(false);
  // The attributes this component put on the trigger, and only those, are
  // taken off again.
  const ownAttributesRef = useRef<Set<string>>(new Set());

  useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

  useEffect(() => {
    setMounted(true);
    setIsTouchDevice(cannotHover());
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
      if (touch === "disable") return false;
      if (touch === "display") return true;
      // touch === 'enable', fall through to normal logic
    }

    // For non-touch or when mounted, use the raw active state
    if (!mounted && !isTouchDevice) return false;

    return rawActive;
  })();

  // Floating UI for portal positioning
  const {
    x,
    y,
    strategy,
    placement: finalPlacement,
    refs: floatingRefs,
  } = useFloating({
    placement,
    open: isActive,
    middleware: [flip(), shift()],
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
      pressedRef.current = false;
      setInternalActive(false);
    }
  }, [triggerType]);

  const handleFocus = useCallback(() => {
    // Keyboard focus opens the card, where `:focus-visible` would show a
    // ring. Focus from a press does not: the pointer's own hover (a tap's
    // compatibility mouse events, on touch) is what opens it then.
    // Tracked here rather than read from `:focus-visible`, which not every
    // engine answers the same way.
    const pressed = pressedRef.current;
    pressedRef.current = false;
    if (triggerType === "hover" && !pressed) {
      handleMouseEnter();
    }
  }, [triggerType, handleMouseEnter]);

  // Focus moving between the trigger and the card keeps it open: Tab goes
  // from one into the other. Leaving both closes it.
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (triggerType !== "hover") return;
      const next = event.relatedTarget as Node | null;
      if (next && (wrapperRef.current?.contains(next) || floatingRef.current?.contains(next))) {
        return;
      }
      handleMouseLeave();
    },
    [triggerType, handleMouseLeave],
  );

  /** The trigger's last tab stop: where Shift+Tab from the card goes back to. */
  const triggerStop = () => {
    const stops = wrapperRef.current ? getFocusableElements(wrapperRef.current) : [];
    return stops[stops.length - 1] ?? null;
  };

  /**
   * A card in a portal sits at the end of the page, so Tab from its trigger
   * skipped it and its links and buttons were out of a keyboard's reach.
   * While it is open, Tab from the trigger goes into the card, and Tab past
   * the card's last stop goes on to whatever follows the trigger.
   */
  const tabIntoCard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || event.shiftKey || !portal || !isActive) return false;
    const card = floatingRef.current;
    const stops = card ? getFocusableElements(card) : [];
    const last = triggerStop();
    if (stops.length === 0 || (last && document.activeElement !== last)) return false;
    event.preventDefault();
    stops[0].focus();
    return true;
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || event.defaultPrevented) return;
    const card = floatingRef.current;
    const wrapper = wrapperRef.current;
    if (!card || !wrapper) return;
    const stops = getFocusableElements(card);
    if (stops.length === 0) return;
    if (event.shiftKey && document.activeElement === stops[0]) {
      const back = triggerStop();
      if (!back) return;
      event.preventDefault();
      back.focus();
    } else if (!event.shiftKey && document.activeElement === stops[stops.length - 1]) {
      const after = getFocusableElements(document.body).find(
        (element) =>
          !card.contains(element) &&
          !wrapper.contains(element) &&
          Boolean(wrapper.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
      if (!after) return;
      event.preventDefault();
      after.focus();
    }
  };

  // A hover trigger that is a role="button" element of its own (an info
  // icon) has no action but this card, so Enter and Space toggle it, as a
  // button should. Native buttons and links keep their own action.
  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (triggerType !== "hover" || tabIntoCard(event) || isControlled) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") !== "button") return;
    if (target.closest("button, a[href], input, select, textarea")) return;
    event.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setInternalActive((active) => !active);
  };

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

  // Content that appears on hover or focus must be dismissible without
  // moving the pointer or focus away (WCAG 1.4.13), or a tooltip can sit
  // over the very thing someone is trying to read. Escape closes it; it
  // reopens the next time the pointer or focus comes back to the trigger.
  useEffect(() => {
    if (triggerType !== "hover" || isControlled || !internalActive) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Focus inside the card would go down with it: it goes back to the trigger.
      if (floatingRef.current?.contains(document.activeElement)) triggerStop()?.focus();
      setInternalActive(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [triggerType, isControlled, internalActive]);

  // The trigger says what the card is to it. A card with something to act
  // on is a disclosure the trigger expands (`aria-expanded`,
  // `aria-controls`); one with only text describes the trigger while it is
  // open (`aria-describedby`), unless the trigger already names a
  // description or its name is the card's text, as an IconButton's tooltip
  // is. Set on the trigger's focusable element, which HoverCard does not
  // render, and never over an attribute the trigger set itself.
  useEffect(() => {
    if (!portal || triggerType !== "hover") return;
    const own = ownAttributesRef.current;
    // Nothing to put on or take off: a closed card that never opened.
    if (!isActive && own.size === 0 && !interactiveRef.current) return;
    const target = wrapperRef.current?.querySelector<HTMLElement>(INTERACTIVE);
    if (!target) return;
    const put = (name: string, value: string) => {
      if (target.hasAttribute(name) && !own.has(name)) return;
      target.setAttribute(name, value);
      own.add(name);
    };
    const drop = (name: string) => {
      if (!own.has(name)) return;
      target.removeAttribute(name);
      own.delete(name);
    };
    const card = floatingRef.current;
    if (isActive && card) {
      if (card.querySelector(INTERACTIVE)) {
        interactiveRef.current = true;
        put("aria-expanded", "true");
        put("aria-controls", card.id);
      } else if (target.getAttribute("aria-label")?.trim() !== card.textContent?.trim()) {
        put("aria-describedby", card.id);
      }
    } else {
      if (interactiveRef.current) put("aria-expanded", "false");
      drop("aria-controls");
      drop("aria-describedby");
    }
  }, [isActive, portal, triggerType]);

  const getAnimationStyle = (): React.CSSProperties => {
    // For portals, always use center origin for consistent animations
    const calculatedTransformOrigin = portal ? "center center" : transformOrigin;

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
    const effectiveActive = portal
      ? isPositioned
      : touch === "display" && !mounted
        ? false
        : isActive;
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
      combinedStyle.filter = shouldAnimate ? "blur(0px)" : `blur(${tokenLength(blur)})`;
      if (combinedStyle.opacity === undefined) {
        combinedStyle.opacity = shouldAnimate ? 1 : 0;
      }
    }

    if (slideUp !== undefined) {
      transforms.push(shouldAnimate ? "translateY(0)" : `translateY(${cssLength(slideUp)})`);
      if (combinedStyle.opacity === undefined) {
        combinedStyle.opacity = shouldAnimate ? 1 : 0;
      }
    }

    if (slideDown !== undefined) {
      transforms.push(shouldAnimate ? "translateY(0)" : `translateY(${cssLength(slideDown, -1)})`);
      if (combinedStyle.opacity === undefined) {
        combinedStyle.opacity = shouldAnimate ? 1 : 0;
      }
    }

    if (slideLeft !== undefined) {
      transforms.push(shouldAnimate ? "translateX(0)" : `translateX(${cssLength(slideLeft)})`);
      if (combinedStyle.opacity === undefined) {
        combinedStyle.opacity = shouldAnimate ? 1 : 0;
      }
    }

    if (slideRight !== undefined) {
      transforms.push(shouldAnimate ? "translateX(0)" : `translateX(${cssLength(slideRight, -1)})`);
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
            onPointerDown={triggerType === "hover" ? handlePress : undefined}
            onMouseDown={triggerType === "hover" ? handlePress : undefined}
            onBlur={triggerType === "hover" ? handleBlur : undefined}
            onKeyDown={triggerType === "hover" ? handleTriggerKeyDown : undefined}
            onClick={triggerType === "click" ? handleClick : undefined}
          >
            {trigger}
          </Flex>
          {isActive &&
            isBrowser &&
            createPortal(
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
                  visibility: isPositioned ? "visible" : "hidden",
                  pointerEvents: isActive ? "auto" : "none",
                }}
                onMouseEnter={triggerType === "hover" ? handleMouseEnter : undefined}
                onMouseLeave={triggerType === "hover" ? handleMouseLeave : undefined}
                aria-hidden={!isActive}
                id={cardId}
                {...flex}
                onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
                  flex.onBlur?.(event);
                  handleBlur(event);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                  flex.onKeyDown?.(event);
                  if (triggerType === "hover") handleCardKeyDown(event);
                }}
              >
                {children}
              </Flex>,
              document.body,
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
          onPointerDown={triggerType === "hover" ? handlePress : undefined}
          onMouseDown={triggerType === "hover" ? handlePress : undefined}
          onBlur={triggerType === "hover" ? handleBlur : undefined}
          onKeyDown={triggerType === "hover" ? handleTriggerKeyDown : undefined}
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
};

Animation.displayName = "Animation";

export { Animation };

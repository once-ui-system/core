"use client";

import {
  type ComponentProps,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Row } from "./Row";

export interface AutoScrollProps extends ComponentProps<typeof Row> {
  children: ReactNode;
  speed?: "slow" | "medium" | "fast";
  hover?: "slow" | "pause" | "none";
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
  scrollGap?: number | string;
}

const DURATIONS = {
  slow: 40000,
  medium: 20000,
  fast: 10000,
};

const AutoScroll = forwardRef<HTMLDivElement, AutoScrollProps>(
  (
    {
      children,
      speed = "medium",
      hover = "slow",
      reverse = false,
      className,
      style,
      scrollGap,
      ...flex
    },
    ref,
  ) => {
    const [isHovering, setIsHovering] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<Animation | null>(null);
    const animationStateRef = useRef({
      currentTime: null as number | null,
      playbackRate: 1,
      playing: true,
    });
    const [contentWidth, setContentWidth] = useState(0);
    const previousReverseRef = useRef(reverse);

    // Measure the content width to calculate proper animation distance
    useEffect(() => {
      if (!contentRef.current) return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          if (newWidth > 0) {
            setContentWidth((prev) => (prev !== newWidth ? newWidth : prev));
          }
        }
      });

      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }, []);

    // Save animation state before updates
    const saveAnimationState = useCallback(() => {
      if (animationRef.current) {
        const animation = animationRef.current;
        const currentTime = animation.currentTime;

        animationStateRef.current = {
          currentTime: typeof currentTime === "number" ? currentTime : null,
          playbackRate: animation.playbackRate,
          playing: animation.playState === "running",
        };
      }
    }, []);

    // Restore animation state after updates
    const restoreAnimationState = useCallback((animation: Animation) => {
      const state = animationStateRef.current;

      if (state.currentTime !== null) {
        animation.currentTime = state.currentTime;
      }

      animation.updatePlaybackRate?.(state.playbackRate);

      if (state.playing) {
        animation.play();
      } else {
        animation.pause();
      }
    }, []);

    // Create or update animation
    const setupAnimation = useCallback(() => {
      if (!wrapperRef.current || contentWidth <= 0) return;

      const element = wrapperRef.current;
      if (typeof element.animate !== "function") return;

      const duration = DURATIONS[speed];
      const parentWidth = element.parentElement?.clientWidth || 0;

      // Save current animation state if it exists
      saveAnimationState();

      // Cancel existing animation
      if (animationRef.current) {
        animationRef.current.cancel();
        animationRef.current = null;
      }

      // Always animate, even if content is not wider than container
      // If content is not wider than container, we'll use the content width as the animation distance
      // This ensures there's always some movement

      // Use the maximum of content width and parent width to ensure smooth animation
      // This ensures that even with small content, we have enough distance to create a visible animation
      const distance = Math.max(contentWidth, parentWidth);

      // Check if reverse direction changed
      const directionChanged = reverse !== previousReverseRef.current;
      previousReverseRef.current = reverse;

      // Set initial position to prevent jump
      if (directionChanged) {
        // Reset animation state when direction changes
        animationStateRef.current.currentTime = null;
      }

      // Use pixel-based animations instead of percentage-based for more precise control
      // For reverse direction (left-to-right), we need to move content in the opposite direction
      const keyframes = reverse
        ? [{ transform: `translateX(${-distance}px)` }, { transform: "translateX(0)" }]
        : [{ transform: "translateX(0)" }, { transform: `translateX(${-distance}px)` }];

      const animation = element.animate(keyframes, {
        duration,
        iterations: Infinity,
        easing: "linear",
      });

      animationRef.current = animation;

      // Restore previous animation state if available
      restoreAnimationState(animation);
    }, [contentWidth, speed, reverse, saveAnimationState, restoreAnimationState]);

    // Setup animation when parameters change
    useEffect(() => {
      setupAnimation();

      return () => {
        if (animationRef.current) {
          animationRef.current.cancel();
          animationRef.current = null;
        }
      };
    }, [setupAnimation]);

    // Handle hover effects
    useEffect(() => {
      const animation = animationRef.current;
      if (!animation) return;

      if (isHovering) {
        if (hover === "pause") {
          animation.pause();
        } else if (hover === "slow") {
          const playbackRate = 0.25;
          animation.updatePlaybackRate?.(playbackRate);
        }
      } else {
        animation.updatePlaybackRate?.(1);
        if (animation.playState === "paused") {
          animation.play();
        }
      }
    }, [isHovering, hover]);

    // Handle window resize events
    useEffect(() => {
      const handleResize = () => {
        if (contentRef.current) {
          const newWidth = contentRef.current.offsetWidth;
          if (newWidth > 0) {
            setContentWidth((prev) => (prev !== newWidth ? newWidth : prev));
          }
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Prevent animation from restarting when other components open/close
    useEffect(() => {
      const observer = new MutationObserver(() => {
        // Don't restart animation when DOM changes elsewhere
        // Just check if we need to recalculate width
        if (contentRef.current) {
          const newWidth = contentRef.current.offsetWidth;
          if (newWidth > 0) {
            setContentWidth((prev) => (Math.abs(newWidth - prev) > 5 ? newWidth : prev));
          }
        }
      });

      // Observe the entire document for changes that might affect layout
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      return () => observer.disconnect();
    }, []);

    const gapStyle = typeof scrollGap === "number" ? `${scrollGap}px` : scrollGap;

    return (
      <Row overflow="hidden" fillWidth ref={ref} className={className} style={style} {...flex}>
        <Row
          fillWidth
          ref={wrapperRef}
          className="will-change-transform"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Row
            fitWidth
            horizontal="around"
            className="whitespace-nowrap shrink-0 min-w-full"
            ref={contentRef}
            style={{ marginRight: gapStyle }}
          >
            {children}
          </Row>
          <Row
            fitWidth
            horizontal="around"
            className="whitespace-nowrap shrink-0 min-w-full"
            style={{ marginRight: gapStyle }}
          >
            {children}
          </Row>
        </Row>
      </Row>
    );
  },
);

AutoScroll.displayName = "AutoScroll";

export { AutoScroll };

"use client";

import React, { useEffect, useRef } from "react";
import { Flex } from ".";

interface MatrixFxProps extends React.ComponentProps<typeof Flex> {
  animationSpeed?: number;
  colors?: string[];
  size?: number;
  spacing?: number;
  revealFrom?: "center" | "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "instant" | "mount";
  flicker?: boolean;
  children?: React.ReactNode;
}

const MatrixFx = React.forwardRef<HTMLDivElement, MatrixFxProps>(
  (
    {
      animationSpeed = 1,
      colors = ["brand-solid-medium"],
      size = 3,
      spacing = 3,
      revealFrom = "center",
      trigger = "instant",
      flicker = false,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const revealStartTimeRef = useRef<number>(Date.now());
    const hideStartTimeRef = useRef<number>(Date.now());
    const maxRevealProgressRef = useRef<number>(0);
    const hideStartProgressRef = useRef<number>(0);
    const isHoveredRef = useRef<boolean>(false);
    const mountAnimationCompleteRef = useRef<boolean>(false);

    useEffect(() => {
      if (forwardedRef) {
        if ("current" in forwardedRef) {
          forwardedRef.current = containerRef.current;
        } else if (typeof forwardedRef === "function") {
          forwardedRef(containerRef.current);
        }
      }
    }, [forwardedRef]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      let canvasWidth = 0;
      let canvasHeight = 0;
      
      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        canvasWidth = rect.width;
        canvasHeight = rect.height;
        canvas.width = rect.width * 2; // 2x for retina
        canvas.height = rect.height * 2;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(2, 2); // Scale for retina
      };

      updateSize();
      window.addEventListener("resize", updateSize);

      // Parse colors - convert token names to CSS variables
      const parsedColors = colors.map((color) => {
        // Get computed value from CSS variable
        const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
        return computedColor || color;
      });

      // Create dot grid
      const totalSize = size + spacing;
      const cols = Math.ceil(canvasWidth / totalSize);
      const rows = Math.ceil(canvasHeight / totalSize);

      interface Dot {
        x: number;
        y: number;
        gridX: number;
        gridY: number;
        color: string;
        baseOpacity: number;
        distanceFromOrigin: number;
        randomOffset: number;
        flickerPhase: number;
        flickerSpeed: number;
      }

      const dots: Dot[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * totalSize + size / 2;
          const y = row * totalSize + size / 2;

          // Calculate distance from reveal origin
          let distanceFromOrigin = 0;
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;

          switch (revealFrom) {
            case "center":
              const dx = x - centerX;
              const dy = y - centerY;
              distanceFromOrigin = Math.sqrt(dx * dx + dy * dy);
              break;
            case "top":
              distanceFromOrigin = y;
              break;
            case "bottom":
              distanceFromOrigin = canvasHeight - y;
              break;
            case "left":
              distanceFromOrigin = x;
              break;
            case "right":
              distanceFromOrigin = canvasWidth - x;
              break;
          }

          dots.push({
            x,
            y,
            gridX: col,
            gridY: row,
            color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
            baseOpacity: 0.3 + Math.random() * 0.7,
            distanceFromOrigin,
            randomOffset: Math.random() * 0.3,
            flickerPhase: Math.random() * Math.PI * 2, // Random starting point
            flickerSpeed: 0.8 + Math.random() * 0.4, // Random speed between 0.8 and 1.2
          });
        }
      }

      // Find max distance for normalization
      const maxDistance = Math.max(...dots.map((d) => d.distanceFromOrigin));


      // Animation loop
      const startTime = Date.now();
      const animate = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const time = (Date.now() - startTime) / 1000; // Time in seconds

        // For instant trigger, show all dots immediately at full opacity
        if (trigger === "instant") {
          dots.forEach((dot) => {
            ctx.fillStyle = dot.color;
            let opacity = dot.baseOpacity;
            
            // Apply flicker effect if enabled
            if (flicker) {
              const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
              const flickerMultiplier = 0.6 + (flickerValue * 0.4); // Oscillate between 0.6 and 1.0
              opacity *= flickerMultiplier;
            }
            
            ctx.globalAlpha = opacity;
            ctx.fillRect(dot.x, dot.y, size, size);
          });
          ctx.globalAlpha = 1;
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // For mount trigger - progressive reveal on load, then static
        if (trigger === "mount") {
          if (!mountAnimationCompleteRef.current) {
            // Revealing animation with explosive easing
            const now = Date.now();
            const elapsed = (now - revealStartTimeRef.current) / 1000;
            // Cubic easing: starts very slow, then explodes
            const revealProgress = Math.pow(elapsed, 3) * animationSpeed * 3;
            
            // Check if animation is complete (max offset is ~1.3)
            if (revealProgress >= 2.0) {
              mountAnimationCompleteRef.current = true;
            }
            
            dots.forEach((dot) => {
              const normalizedDistance = dot.distanceFromOrigin / maxDistance;
              const introOffset = normalizedDistance * 0.8 + dot.randomOffset * 0.5;

              let opacity = 0;
              if (revealProgress > introOffset) {
                const fadeIn = (revealProgress - introOffset) * 8;
                opacity = Math.min(1, fadeIn * fadeIn) * dot.baseOpacity;
              }

              if (opacity > 0) {
                ctx.fillStyle = dot.color;
                ctx.globalAlpha = opacity;
                ctx.fillRect(dot.x, dot.y, size, size);
              }
            });
          } else {
            // Animation complete - show all dots with optional flicker
            dots.forEach((dot) => {
              ctx.fillStyle = dot.color;
              let opacity = dot.baseOpacity;
              
              if (flicker) {
                const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                const flickerMultiplier = 0.6 + (flickerValue * 0.4);
                opacity *= flickerMultiplier;
              }
              
              ctx.globalAlpha = opacity;
              ctx.fillRect(dot.x, dot.y, size, size);
            });
          }
          
          ctx.globalAlpha = 1;
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // For hover trigger with animation
        if (isHoveredRef.current) {
          // Revealing animation with explosive easing
          const now = Date.now();
          const elapsed = (now - revealStartTimeRef.current) / 1000;
          // Cubic easing: starts very slow, then explodes
          const revealProgress = Math.pow(elapsed, 3) * animationSpeed * 3;
          
          // Cap progress to prevent infinite growth (max offset is ~1.3)
          const cappedProgress = Math.min(revealProgress, 2.0);
          
          // Track maximum progress for reverse animation
          maxRevealProgressRef.current = cappedProgress;

          dots.forEach((dot) => {
            const normalizedDistance = dot.distanceFromOrigin / maxDistance;
            const introOffset = normalizedDistance * 0.8 + dot.randomOffset * 0.5; // Much lower threshold

            let opacity = 0;
            if (cappedProgress > introOffset) {
              // Explosive opacity increase
              const fadeIn = (cappedProgress - introOffset) * 8; // Faster fade-in
              opacity = Math.min(1, fadeIn * fadeIn) * dot.baseOpacity;
              
              // Apply flicker effect if enabled
              if (flicker) {
                const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                const flickerMultiplier = 0.6 + (flickerValue * 0.4); // Oscillate between 0.6 and 1.0
                opacity *= flickerMultiplier;
              }
            }

            if (opacity > 0) {
              ctx.fillStyle = dot.color;
              ctx.globalAlpha = opacity;
              ctx.fillRect(dot.x, dot.y, size, size);
            }
          });

        } else {
          // Reverse animation when hover ends - only run if there's something to hide
          if (hideStartProgressRef.current > 0) {
            const elapsed = (Date.now() - hideStartTimeRef.current) / 1000;
            // Use quadratic easing for faster hide (power of 2)
            const hideSpeed = animationSpeed * 6; // Faster to handle max progress of 2.0
            const hideProgress = Math.pow(elapsed, 2) * hideSpeed;
            
            // Reverse from the progress we had when hide started
            const reverseProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
            
            if (reverseProgress > 0.01) { // Small threshold to ensure completion
              // Still have dots to hide
              dots.forEach((dot) => {
                const normalizedDistance = dot.distanceFromOrigin / maxDistance;
                const introOffset = normalizedDistance * 0.8 + dot.randomOffset * 0.5;

                let opacity = 0;
                if (reverseProgress > introOffset) {
                  const fadeIn = (reverseProgress - introOffset) * 8;
                  opacity = Math.min(1, fadeIn * fadeIn) * dot.baseOpacity;
                  
                  // Apply flicker effect if enabled
                  if (flicker) {
                    const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                    const flickerMultiplier = 0.6 + (flickerValue * 0.4);
                    opacity *= flickerMultiplier;
                  }
                }

                if (opacity > 0) {
                  ctx.fillStyle = dot.color;
                  ctx.globalAlpha = opacity;
                  ctx.fillRect(dot.x, dot.y, size, size);
                }
              });
            } else {
              // Hide animation complete, reset progress and clear canvas
              hideStartProgressRef.current = 0;
            }
          }
        }

        ctx.globalAlpha = 1;
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener("resize", updateSize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [colors, size, spacing, animationSpeed, revealFrom, trigger, flicker]);

    const handleMouseEnter = () => {
      if (trigger === "hover" && !isHoveredRef.current) {
        const now = Date.now();
        
        // If we're currently hiding, resume from where we left off
        if (hideStartProgressRef.current > 0) {
          // Calculate current position during hide
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = animationSpeed * 6;
          const hideProgress = Math.pow(hideElapsed, 2) * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          
          // Reverse the cubic easing formula: progress = elapsed^3 * speed * 3
          // So: elapsed = (progress / (speed * 3)) ^ (1/3)
          const effectiveElapsed = Math.pow(currentProgress / (animationSpeed * 3), 1 / 3);
          const simulatedStartTime = now - effectiveElapsed * 1000;
          revealStartTimeRef.current = simulatedStartTime;
        } else {
          // Fresh start
          revealStartTimeRef.current = now;
        }
        
        isHoveredRef.current = true;
        hideStartProgressRef.current = 0; // Clear hide state
      }
    };

    const handleMouseMove = () => {
      // Recovery mechanism: if cursor is moving over the element but we're not in hover state, trigger it
      if (trigger === "hover" && !isHoveredRef.current) {
        handleMouseEnter();
      }
    };

    const handleMouseLeave = () => {
      if (trigger === "hover" && isHoveredRef.current) {
        const currentProgress = maxRevealProgressRef.current;
        hideStartTimeRef.current = Date.now();
        hideStartProgressRef.current = currentProgress; // Capture current progress
        isHoveredRef.current = false;
      }
    };

    return (
      <Flex
        ref={containerRef}
        fill
        overflow="hidden"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Let mouse events pass through to parent
          }}
        />
        {children}
      </Flex>
    );
  },
);

MatrixFx.displayName = "MatrixFx";
export { MatrixFx };

"use client";

import React, { useEffect, useRef } from "react";
import { SpacingToken } from "../types";
import { DisplayProps } from "../interfaces";
import { Flex } from ".";
import { useInViewport } from "../hooks/useInViewport";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface ParticleProps extends React.ComponentProps<typeof Flex> {
  density?: number;
  color?: string;
  size?: SpacingToken;
  speed?: number;
  interactive?: boolean;
  mode?: "repel" | "attract";
  intensity?: number;
  opacity?: DisplayProps["opacity"];
  reducedMotion?: boolean | "auto";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Particle = React.forwardRef<HTMLDivElement, ParticleProps>(
  (
    {
      density = 100,
      color = "brand-on-background-weak",
      size = "2",
      speed = 0.3,
      interactive = false,
      mode = "repel",
      intensity = 20,
      opacity = 100,
      reducedMotion = "auto",
      children,
      className,
      style,
      ...rest
    },
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInViewport = useInViewport(containerRef);
    const { shouldAnimate } = useReducedMotion(reducedMotion);

    useEffect(() => {
      if (forwardedRef && "current" in forwardedRef) {
        forwardedRef.current = containerRef.current;
      } else if (typeof forwardedRef === "function") {
        forwardedRef(containerRef.current);
      }
    }, [forwardedRef]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // If reduced motion, render static particles with no animation loop
      const effectiveDensity = shouldAnimate ? density : Math.min(density, 30);

      const particleEls: HTMLElement[] = [];

      // Flat arrays for fast iteration — no Map lookups or style parsing per frame
      const currentX = new Float32Array(effectiveDensity);
      const currentY = new Float32Array(effectiveDensity);
      const initialX = new Float32Array(effectiveDensity);
      const initialY = new Float32Array(effectiveDensity);
      const targetX = new Float32Array(effectiveDensity);
      const targetY = new Float32Array(effectiveDensity);

      let mousePosition = { x: -1000, y: -1000 };
      let animationFrameId: number | null = null;

      const parsedSize = `var(--static-space-${size})`;
      const parsedOpacity = `${opacity}%`;
      const movementSpeed = speed * 0.08;
      const repulsionStrength = 0.15 * (speed || 1);

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mousePosition = {
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        };
      };

      // Create particles using translate3d instead of left/top
      for (let i = 0; i < effectiveDensity; i++) {
        const el = document.createElement("div");
        el.style.cssText = `
          position:absolute;left:0;top:0;
          width:${parsedSize};height:${parsedSize};
          background:var(--${color});
          border-radius:50%;
          pointer-events:none;
          opacity:${parsedOpacity};
          will-change:transform;
        `;

        const ix = 10 + Math.random() * 80;
        const iy = 10 + Math.random() * 80;

        initialX[i] = ix;
        initialY[i] = iy;
        currentX[i] = ix;
        currentY[i] = iy;
        targetX[i] = ix;
        targetY[i] = iy;

        el.style.transform = `translate3d(${ix}cqw, ${iy}cqh, 0)`;
        container.appendChild(el);
        particleEls.push(el);
      }

      // If reduced motion or not in viewport initially, just place them statically
      if (!shouldAnimate) return () => cleanup();

      const updateParticles = () => {
        const time = Date.now() * 0.001 * speed;

        for (let i = 0; i < effectiveDensity; i++) {
          const cx = currentX[i];
          const cy = currentY[i];

          const baseNoiseX = Math.sin(time + i) * 0.5;
          const baseNoiseY = Math.cos(time + i * 1.2) * 0.5;

          let tx = initialX[i] + baseNoiseX;
          let ty = initialY[i] + baseNoiseY;

          if (interactive) {
            const dx = mousePosition.x - cx;
            const dy = mousePosition.y - cy;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < intensity) {
              const angle = Math.atan2(dy, dx);

              if (mode === "attract") {
                const minDistance = 8;
                if (distance <= minDistance) {
                  tx = mousePosition.x;
                  ty = mousePosition.y;
                } else {
                  const normalizedDistance = Math.min(distance / intensity, 1);
                  const force = distance * repulsionStrength * normalizedDistance * 0.3;
                  tx = cx + Math.cos(angle) * force;
                  ty = cy + Math.sin(angle) * force;
                }
              } else {
                const force = (intensity - distance) * repulsionStrength;
                tx -= Math.cos(angle) * force;
                ty -= Math.sin(angle) * force;
              }
            }
          }

          tx = Math.max(5, Math.min(95, tx));
          ty = Math.max(5, Math.min(95, ty));

          targetX[i] = tx;
          targetY[i] = ty;

          const nx = cx + (tx - cx) * movementSpeed;
          const ny = cy + (ty - cy) * movementSpeed;
          currentX[i] = nx;
          currentY[i] = ny;

          particleEls[i].style.transform = `translate3d(${nx}cqw, ${ny}cqh, 0)`;
        }

        animationFrameId = requestAnimationFrame(updateParticles);
      };

      if (interactive) {
        container.addEventListener("mousemove", handleMouseMove, { passive: true });
      }

      // Start animation only if in viewport
      if (isInViewport) {
        animationFrameId = requestAnimationFrame(updateParticles);
      }

      function cleanup() {
        container!.removeEventListener("mousemove", handleMouseMove);
        if (animationFrameId != null) {
          cancelAnimationFrame(animationFrameId);
        }
        particleEls.forEach((el) => el.remove());
      }

      return () => cleanup();
    }, [color, size, speed, interactive, intensity, opacity, density, mode, shouldAnimate, isInViewport]);

    return (
      <Flex
        ref={containerRef}
        fill
        position="relative"
        pointerEvents={interactive ? "auto" : "none"}
        className={className}
        style={{ containerType: "size", ...style }}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

Particle.displayName = "Particle";
export { Particle };

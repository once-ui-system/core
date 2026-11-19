"use client";

import React, { useEffect, useRef } from "react";
import { useInViewport } from "../hooks/useInViewport";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { DisplayProps } from "../interfaces";
import { cssColor } from "../internal/cssColor";
import {
  createField,
  type Field,
  type ParticleFocus,
  type ParticleShape,
  scatterField,
  stepField,
} from "../internal/particleField";
import type { ColorValue, SpacingToken } from "../types";
import { Flex } from "./Flex";

export type { ParticleFocus, ParticleShape } from "../internal/particleField";

interface ParticleFxProps extends React.ComponentProps<typeof Flex> {
  /** How many particles. */
  density?: number;
  color?: ColorValue;
  /** Largest particle size; each particle is drawn between 40% and 130% of it. */
  size?: SpacingToken;
  /** How fast particles drift and settle back home. */
  speed?: number;
  /** Particles react to the pointer. */
  interactive?: boolean;
  mode?: "repel" | "attract";
  /** The pointer's reach, as a percentage of the field's smaller side. */
  intensity?: number;
  opacity?: DisplayProps["opacity"];
  reducedMotion?: boolean | "auto";
  /**
   * Gathers part of the field into a mark: `"star"` (four points), `"ring"`,
   * `"diamond"`, or your own points in a -1…1 box. Without it the particles
   * spread evenly.
   */
  shape?: ParticleShape;
  /** Share of the particles that form the shape, 0 to 1. */
  gather?: number;
  /** Where the shape sits, as fractions of the field. Defaults to the centre, radius 0.35. */
  focus?: ParticleFocus;
  /** Share of the shape's particles drawn larger in `sparkColor`, 0 to 1. */
  sparks?: number;
  sparkColor?: ColorValue;
  /** Particles slowly brighten and dim. */
  twinkle?: boolean;
  /** A soft glow in `sparkColor` behind the shape. */
  glow?: boolean;
  /** Faint orbit rings around the shape. */
  orbits?: boolean;
  /** Particles start scattered and gather into place when the field first shows. */
  entrance?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Resolves a colour prop (token or raw CSS) to the computed value a canvas can paint. */
const resolveColor = (host: HTMLElement, value: string): string => {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color:${cssColor(value)}`;
  host.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || "currentColor";
};

/** Resolves a spacing token to px. */
const resolveSize = (host: HTMLElement, token: SpacingToken): number => {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;width:var(--static-space-${token})`;
  host.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px > 0 ? px : Number(token) || 2;
};

const ParticleFx = React.forwardRef<HTMLDivElement, ParticleFxProps>(
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
      shape,
      gather = 0.6,
      focus,
      sparks = 0,
      sparkColor = "accent-on-background-weak",
      twinkle = true,
      glow = false,
      orbits = false,
      entrance = false,
      children,
      className,
      style,
      ...rest
    },
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isInViewport = useInViewport(containerRef);
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const enteredRef = useRef(false);

    useEffect(() => {
      if (forwardedRef && "current" in forwardedRef) {
        forwardedRef.current = containerRef.current;
      } else if (typeof forwardedRef === "function") {
        forwardedRef(containerRef.current);
      }
    }, [forwardedRef]);

    const shapeKey = Array.isArray(shape) ? `points:${shape.length}` : (shape ?? "none");

    // biome-ignore lint/correctness/useExhaustiveDependencies: `shape` points and `focus` are compared by value, through shapeKey and the focus fields.
    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const ctx = canvas.getContext("2d");

      const ink = resolveColor(container, color);
      const spark = resolveColor(container, sparkColor);
      const maxSize = resolveSize(container, size);
      const alpha = Math.min(1, Math.max(0, Number(opacity) / 100));

      let field: Field = createField({ width: 0, height: 0, count: 0 });
      let pointer: { x: number; y: number } | null = null;
      let frame: number | null = null;
      let time = 0;

      const build = () => {
        const rect = container.getBoundingClientRect();
        const width = rect.width || container.clientWidth || 0;
        const height = rect.height || container.clientHeight || 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        field = createField({
          width,
          height,
          count: density,
          shape,
          gather,
          focus,
          sparks,
          size: maxSize,
        });
        if (entrance && shouldAnimate && !enteredRef.current) {
          scatterField(field);
          enteredRef.current = true;
        }
        canvas.setAttribute("data-fx-particles", String(field.count));
      };

      const draw = () => {
        if (!ctx) return;
        const { width, height } = field;
        ctx.clearRect(0, 0, width, height);
        const f = field.focus;

        if (f && glow) {
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 0.9);
          g.addColorStop(0, spark);
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.22 * alpha;
          ctx.fillStyle = g;
          ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
        }

        if (f && orbits) {
          ctx.globalAlpha = 0.07 * alpha;
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1;
          for (const k of [1.15, 1.6, 2.2]) {
            ctx.beginPath();
            ctx.ellipse(
              f.x,
              f.y,
              f.r * k,
              f.r * k * 0.34,
              -0.32 + time * 0.00004 * k,
              0,
              Math.PI * 2,
            );
            ctx.stroke();
          }
        }

        for (let i = 0; i < field.count; i++) {
          const lit = twinkle ? 0.55 + 0.45 * Math.sin(field.phase[i] + time * 0.002) : 1;
          const isSpark = field.spark[i] === 1;
          const base = isSpark ? 0.6 + 0.4 * lit : (field.gathered[i] || !f ? 0.95 : 0.4) * lit;
          const s = field.size[i] * (isSpark ? 1.6 : 1);
          ctx.globalAlpha = base * alpha;
          ctx.fillStyle = isSpark ? spark : ink;
          ctx.fillRect(field.x[i] - s / 2, field.y[i] - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
      };

      const tick = () => {
        time += 16;
        stepField(field, {
          pointer,
          radius: (Math.min(field.width, field.height) * intensity) / 100,
          mode,
          speed,
          time,
        });
        draw();
        frame = requestAnimationFrame(tick);
      };

      const onMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };
      const onLeave = () => {
        pointer = null;
      };

      build();
      draw();

      const resize =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => {
              build();
              draw();
            });
      resize?.observe(container);

      if (interactive) {
        container.addEventListener("pointermove", onMove, { passive: true });
        container.addEventListener("pointerleave", onLeave);
      }
      if (shouldAnimate && isInViewport) {
        frame = requestAnimationFrame(tick);
      }

      return () => {
        resize?.disconnect();
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerleave", onLeave);
        if (frame != null) cancelAnimationFrame(frame);
      };
    }, [
      color,
      sparkColor,
      size,
      speed,
      interactive,
      intensity,
      opacity,
      density,
      mode,
      shapeKey,
      gather,
      focus?.x,
      focus?.y,
      focus?.radius,
      sparks,
      twinkle,
      glow,
      orbits,
      entrance,
      shouldAnimate,
      isInViewport,
    ]);

    return (
      <Flex
        ref={containerRef}
        fill
        position="relative"
        pointerEvents={interactive ? "auto" : "none"}
        className={className}
        style={style}
        {...rest}
      >
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas is not focusable; this one is decoration. */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          // Lets a test or a screenshot tool find (and hide) the particles.
          data-fx-particle=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
        {children}
      </Flex>
    );
  },
);

ParticleFx.displayName = "ParticleFx";

/**
 * @deprecated Renamed to `ParticleFx`, in line with the other effects. This
 * name keeps working through 2.x and is removed in 3.0.
 */
const Particle = ParticleFx;

export { Particle, ParticleFx };

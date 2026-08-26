"use client";

import { cva } from "class-variance-authority";
import type { MouseEvent, ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "../classes/utils";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Flex, type FlexComponentProps } from "./Flex";

export type WeatherType = "rain" | "snow" | "leaves" | "lightning";

export const weatherFxVariants = cva("relative overflow-hidden w-full h-full");
const WEATHER_FX_BASE = weatherFxVariants();

export interface WeatherFxProps extends FlexComponentProps {
  type?: WeatherType;
  speed?: number;
  colors?: string[];
  intensity?: number;
  angle?: number;
  duration?: number;
  trigger?: "mount" | "hover" | "click" | "manual";
  active?: boolean;
  reducedMotion?: boolean | "auto";
  children?: ReactNode;
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
  opacity: number;
  thickness: number;
}

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
  depth: number;
}

interface Leaf {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color1: string;
  color2: string;
  opacity: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  rotation3D: number;
  rotation3DSpeed: number;
  depth: number;
}

interface LightningBranch {
  startIndex: number;
  segments: { x: number; y: number }[];
  thickness: number;
  children: LightningBranch[];
}

interface Lightning {
  x: number;
  y: number;
  segments: { x: number; y: number }[];
  color: string;
  opacity: number;
  thickness: number;
  lifetime: number;
  age: number;
  branches: LightningBranch[];
  revealDuration: number;
}

const resolveColors = (container: HTMLElement, colors: string[]): string[] => {
  return colors.map((color) => {
    const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
    const trimmed = computedColor?.trim();
    return trimmed || color;
  });
};

const createRainParticles = (
  canvasWidth: number,
  canvasHeight: number,
  colors: string[],
  intensity: number,
  speed: number,
  angle: number,
): RainDrop[] => {
  const particles: RainDrop[] = [];
  const angleRad = (angle * Math.PI) / 180;
  const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
  const spawnWidth = canvasWidth + horizontalOffset * 2;

  for (let i = 0; i < intensity; i++) {
    const spawnX = Math.random() * spawnWidth - horizontalOffset;
    particles.push({
      x: spawnX,
      y: Math.random() * canvasHeight - canvasHeight,
      length: 10 + Math.random() * 20,
      speed: (2 + Math.random() * 3) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.3 + Math.random() * 0.5,
      thickness: 1 + Math.random() * 1.5,
    });
  }

  return particles;
};

const createSnowParticles = (
  canvasWidth: number,
  canvasHeight: number,
  colors: string[],
  intensity: number,
  speed: number,
  angle: number,
): Snowflake[] => {
  const particles: Snowflake[] = [];
  const angleRad = (angle * Math.PI) / 180;
  const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
  const spawnWidth = canvasWidth + horizontalOffset * 2;

  for (let i = 0; i < intensity; i++) {
    const depth = Math.random();
    const size = 2 + depth * 4;
    const spawnX = Math.random() * spawnWidth - horizontalOffset;

    particles.push({
      x: spawnX,
      y: Math.random() * canvasHeight - canvasHeight,
      size,
      speed: (0.3 + depth * 0.7) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.4 + depth * 0.5,
      swayAmplitude: 20 + Math.random() * 30,
      swaySpeed: 0.5 + Math.random() * 1,
      swayOffset: Math.random() * Math.PI * 2,
      depth,
    });
  }

  return particles;
};

const createLeavesParticles = (
  canvasWidth: number,
  canvasHeight: number,
  colors: string[],
  intensity: number,
  speed: number,
  angle: number,
): Leaf[] => {
  const particles: Leaf[] = [];
  const angleRad = (angle * Math.PI) / 180;
  const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
  const spawnWidth = canvasWidth + horizontalOffset * 2;

  for (let i = 0; i < intensity; i++) {
    const depth = Math.random();
    const width = 8 + depth * 12;
    const height = width * (0.6 + Math.random() * 0.4);
    const spawnX = Math.random() * spawnWidth - horizontalOffset;
    const colorIndex = Math.floor(Math.random() * colors.length);
    const color1 = colors[colorIndex];
    const color2 = colors[Math.min(colorIndex + 1, colors.length - 1)];

    particles.push({
      x: spawnX,
      y: Math.random() * canvasHeight - canvasHeight,
      width,
      height,
      speed: (0.4 + depth * 0.8) * speed,
      color1,
      color2,
      opacity: 0.6 + depth * 0.3,
      swayAmplitude: 30 + Math.random() * 50,
      swaySpeed: 0.3 + Math.random() * 0.7,
      swayOffset: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      rotation3D: Math.random() * Math.PI * 2,
      rotation3DSpeed: (Math.random() - 0.5) * 0.06,
      depth,
    });
  }

  return particles;
};

const createParticles = (
  type: WeatherType,
  canvasWidth: number,
  canvasHeight: number,
  colors: string[],
  intensity: number,
  speed: number,
  angle: number,
): (RainDrop | Snowflake | Leaf | Lightning)[] => {
  const cw = canvasWidth > 0 ? canvasWidth : 400;
  const ch = canvasHeight > 0 ? canvasHeight : 400;
  switch (type) {
    case "rain":
      return createRainParticles(cw, ch, colors, intensity, speed, angle);
    case "snow":
      return createSnowParticles(cw, ch, colors, intensity, speed, angle);
    case "leaves":
      return createLeavesParticles(cw, ch, colors, intensity, speed, angle);
    case "lightning":
      return [];
    default:
      return [];
  }
};

const generateBranch = (
  startX: number,
  startY: number,
  baseSegmentLength: number,
  branchLevel: number,
  maxLevel: number,
  angle: number,
  parentThickness: number,
): { segments: { x: number; y: number }[]; children: LightningBranch[] } => {
  const segments: { x: number; y: number }[] = [];
  const children: LightningBranch[] = [];

  const lengthMultiplier = 0.7 ** branchLevel;
  const branchLength = 3 + Math.floor(Math.random() * 4);

  let currentX = startX;
  let currentY = startY;
  let currentAngle = angle;

  for (let i = 0; i < branchLength; i++) {
    const segmentLength = baseSegmentLength * lengthMultiplier * (0.6 + Math.random() * 0.6);
    currentAngle += (Math.random() - 0.5) * 0.8;
    currentX += Math.cos(currentAngle) * segmentLength;
    currentY += Math.sin(currentAngle) * segmentLength;

    segments.push({ x: currentX, y: currentY });

    if (branchLevel < maxLevel && i > 0) {
      const branchProbability = 0.35 - branchLevel * 0.1;
      if (Math.random() < branchProbability) {
        const angleDeviation = (Math.random() - 0.5) * Math.PI;
        const childAngle = currentAngle + angleDeviation;
        const childBranch = generateBranch(
          currentX,
          currentY,
          baseSegmentLength,
          branchLevel + 1,
          maxLevel,
          childAngle,
          parentThickness,
        );

        if (childBranch.segments.length > 0) {
          children.push({
            startIndex: i,
            segments: childBranch.segments,
            thickness: parentThickness * 0.6 ** (branchLevel + 1),
            children: childBranch.children,
          });
        }
      }
    }
  }

  return { segments, children };
};

const generateLightningBolt = (
  startX: number,
  startY: number,
  endY: number,
  parsedColors: string[],
): Lightning => {
  const segments: { x: number; y: number }[] = [];
  const branches: LightningBranch[] = [];

  let currentX = startX;
  let currentY = startY;
  const baseSegmentLength = 12 + Math.random() * 15;
  const mainThickness = 2.5 + Math.random() * 1.5;

  segments.push({ x: currentX, y: currentY });

  let currentAngle = Math.PI / 2;

  while (currentY < endY) {
    const segmentLength = baseSegmentLength * (0.5 + Math.random() * 0.8);
    currentAngle += (Math.random() - 0.5) * 0.6;

    if (currentAngle < Math.PI / 4) currentAngle = Math.PI / 4;
    if (currentAngle > (3 * Math.PI) / 4) currentAngle = (3 * Math.PI) / 4;

    currentX += Math.cos(currentAngle) * segmentLength;
    currentY += Math.sin(currentAngle) * segmentLength;

    segments.push({ x: currentX, y: currentY });

    if (Math.random() < 0.35 && segments.length > 2) {
      const angleDeviation = (Math.random() - 0.5) * ((2 * Math.PI) / 3);
      const branchAngle = currentAngle + angleDeviation;
      const primaryBranch = generateBranch(
        currentX,
        currentY,
        baseSegmentLength,
        1,
        3,
        branchAngle,
        mainThickness,
      );

      if (primaryBranch.segments.length > 0) {
        branches.push({
          startIndex: segments.length - 1,
          segments: primaryBranch.segments,
          thickness: mainThickness * 0.6,
          children: primaryBranch.children,
        });
      }
    }
  }

  return {
    x: startX,
    y: startY,
    segments,
    color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
    opacity: 0.8 + Math.random() * 0.2,
    thickness: mainThickness,
    lifetime: 0.4 + Math.random() * 0.2,
    age: 0,
    branches,
    revealDuration: 0.08 + Math.random() * 0.04,
  };
};

const WeatherFx = forwardRef<HTMLDivElement, WeatherFxProps>(
  (
    {
      type = "rain",
      speed = 1,
      colors = ["brand-solid-medium"],
      intensity = 50,
      angle = 0,
      duration,
      trigger = "mount",
      active = false,
      reducedMotion = "auto",
      cursor,
      className,
      style,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const particlesRef = useRef<(RainDrop | Snowflake | Leaf | Lightning)[]>([]);
    const timeRef = useRef<number>(0);
    const isEmittingRef = useRef<boolean>(trigger === "mount" || (trigger === "manual" && active));
    const emitStartTimeRef = useRef<number>(Date.now());
    const isHoveredRef = useRef<boolean>(false);
    const lastLightningTimeRef = useRef<number>(0);
    const lastBoltCountRef = useRef<number>(0);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Respond to external control in manual mode
    useEffect(() => {
      if (trigger === "manual") {
        if (active) {
          if (particlesRef.current.length === 0) {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
              const cw = canvas.width / 2;
              const ch = canvas.height / 2;
              const parsedColors = resolveColors(container, colors);
              particlesRef.current = createParticles(
                type,
                cw,
                ch,
                parsedColors,
                intensity,
                speed,
                angle,
              );
            }
          }
          isEmittingRef.current = true;
          emitStartTimeRef.current = Date.now();
        } else {
          isEmittingRef.current = false;
        }
      }
    }, [trigger, active, type, colors, intensity, speed, angle]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let canvasWidth = 0;
      let canvasHeight = 0;

      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        canvasWidth = rect.width;
        canvasHeight = rect.height;
        canvas.width = Math.floor(rect.width * 2);
        canvas.height = Math.floor(rect.height * 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(2, 2);
      };

      updateSize();
      window.addEventListener("resize", updateSize);

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          updateSize();
        });
        resizeObserver.observe(container);
      }

      // Parse colors - convert token names to CSS variables
      const parsedColors = resolveColors(container, colors);

      // Initialize particles only for mount trigger
      if (particlesRef.current.length === 0 && trigger === "mount") {
        particlesRef.current = createParticles(
          type,
          canvasWidth,
          canvasHeight,
          parsedColors,
          intensity,
          speed,
          angle,
        );
      }

      // Animation loop
      const angleRad = (angle * Math.PI) / 180;
      const dx = Math.sin(angleRad);
      const dy = Math.cos(angleRad);
      const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);

      const animate = () => {
        timeRef.current += 0.016;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Check if we should still be emitting new particles
        const shouldEmit = trigger === "hover" ? isHoveredRef.current : isEmittingRef.current;

        // Check duration limit
        if (duration && isEmittingRef.current && trigger !== "manual") {
          const elapsed = (Date.now() - emitStartTimeRef.current) / 1000;
          if (elapsed > duration) {
            isEmittingRef.current = false;
          }
        }

        if (type === "rain") {
          (particlesRef.current as RainDrop[]).forEach((drop) => {
            drop.y += drop.speed * dy;
            drop.x += drop.speed * dx;

            const leftBound = -horizontalOffset - 50;
            const rightBound = canvasWidth + horizontalOffset + 50;

            if (drop.y > canvasHeight || drop.x < leftBound || drop.x > rightBound) {
              if (shouldEmit) {
                drop.y = -drop.length;
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                drop.x = Math.random() * spawnWidth - horizontalOffset;
              } else {
                drop.y = canvasHeight + 1000;
              }
            }

            const x1 = drop.x;
            const y1 = drop.y;
            const x2 = drop.x + dx * drop.length;
            const y2 = drop.y + dy * drop.length;

            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(1, drop.color);

            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.globalAlpha = drop.opacity;
            ctx.lineWidth = drop.thickness;
            ctx.lineCap = "round";
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          });
        } else if (type === "snow") {
          (particlesRef.current as Snowflake[]).forEach((flake) => {
            const swayX =
              Math.sin(timeRef.current * flake.swaySpeed + flake.swayOffset) * flake.swayAmplitude;

            flake.y += flake.speed * dy;
            flake.x += flake.speed * dx;

            const leftBound = -horizontalOffset - 100;
            const rightBound = canvasWidth + horizontalOffset + 100;

            if (flake.y > canvasHeight || flake.x < leftBound || flake.x > rightBound) {
              if (shouldEmit) {
                flake.y = -flake.size;
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                flake.x = Math.random() * spawnWidth - horizontalOffset;
              } else {
                flake.y = canvasHeight + 1000;
              }
            }

            ctx.globalAlpha = flake.opacity;
            ctx.fillStyle = flake.color;

            ctx.beginPath();
            ctx.arc(flake.x + swayX, flake.y, flake.size / 2, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (type === "leaves") {
          (particlesRef.current as Leaf[]).forEach((leaf) => {
            const swayX =
              Math.sin(timeRef.current * leaf.swaySpeed + leaf.swayOffset) * leaf.swayAmplitude;

            leaf.rotation += leaf.rotationSpeed;
            leaf.rotation3D += leaf.rotation3DSpeed;

            leaf.y += leaf.speed * dy;
            leaf.x += leaf.speed * dx;

            const leftBound = -horizontalOffset - 100;
            const rightBound = canvasWidth + horizontalOffset + 100;

            if (leaf.y > canvasHeight || leaf.x < leftBound || leaf.x > rightBound) {
              if (shouldEmit) {
                leaf.y = -leaf.height;
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                leaf.x = Math.random() * spawnWidth - horizontalOffset;
                leaf.rotation = Math.random() * Math.PI * 2;
              } else {
                leaf.y = canvasHeight + 1000;
              }
            }

            const scaleXRaw = Math.cos(leaf.rotation3D);
            const scaleX = scaleXRaw > 0 ? Math.max(0.15, scaleXRaw) : Math.min(-0.15, scaleXRaw);

            ctx.save();
            ctx.translate(leaf.x + swayX, leaf.y);
            ctx.rotate(leaf.rotation);
            ctx.scale(scaleX, 1);
            const opacityMultiplier = Math.max(0.5, Math.abs(scaleXRaw * 0.3 + 0.7));
            ctx.globalAlpha = leaf.opacity * opacityMultiplier;

            const gradient = ctx.createLinearGradient(-leaf.width / 2, 0, leaf.width / 2, 0);
            gradient.addColorStop(0, leaf.color1);
            gradient.addColorStop(0.5, leaf.color2);
            gradient.addColorStop(1, leaf.color1);

            ctx.fillStyle = gradient;
            ctx.beginPath();

            const w = leaf.width / 2;
            const h = leaf.height / 2;

            ctx.moveTo(0, -h);
            ctx.bezierCurveTo(w * 0.7, -h * 0.5, w * 0.7, h * 0.5, 0, h);
            ctx.bezierCurveTo(-w * 0.7, h * 0.5, -w * 0.7, -h * 0.5, 0, -h);

            ctx.fill();
            ctx.restore();
          });
        } else if (type === "lightning") {
          const currentTime = Date.now();
          const timeSinceLastLightning = (currentTime - lastLightningTimeRef.current) / 1000;
          const spawnInterval = Math.max(0.3, 15 / intensity);

          if (shouldEmit && timeSinceLastLightning > spawnInterval) {
            let boltCount = 1;

            if (lastBoltCountRef.current > 1) {
              boltCount = 1;
            } else {
              if (intensity > 60) {
                boltCount = Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 3) : 1;
              } else if (intensity > 30) {
                boltCount = Math.random() < 0.5 ? 2 + Math.floor(Math.random() * 2) : 1;
              } else if (intensity > 15) {
                boltCount = Math.random() < 0.3 ? 2 : 1;
              }
            }

            lastBoltCountRef.current = boltCount;

            for (let i = 0; i < boltCount; i++) {
              const startX = Math.random() * canvasWidth;
              const bolt = generateLightningBolt(startX, 0, canvasHeight, parsedColors);
              bolt.age = -i * 0.025;
              (particlesRef.current as Lightning[]).push(bolt);
            }

            lastLightningTimeRef.current = currentTime;
          }

          (particlesRef.current as Lightning[]).forEach((bolt, index) => {
            bolt.age += 0.016;

            if (bolt.age < 0) return;

            if (bolt.age > bolt.lifetime) {
              (particlesRef.current as Lightning[]).splice(index, 1);
              return;
            }

            const revealProgress = Math.min(1, bolt.age / bolt.revealDuration);
            const lifeProgress = bolt.age / bolt.lifetime;
            let currentOpacity = bolt.opacity;

            if (lifeProgress < bolt.revealDuration / bolt.lifetime) {
              currentOpacity *= revealProgress;
            } else if (lifeProgress < 0.3) {
              currentOpacity *= 1;
            } else {
              const fadeProgress = (lifeProgress - 0.3) / 0.7;
              currentOpacity *= 1 - fadeProgress;
            }

            const totalSegments = bolt.segments.length;
            const segmentsToDraw = Math.ceil(totalSegments * revealProgress);

            ctx.globalAlpha = currentOpacity;
            ctx.strokeStyle = bolt.color;
            ctx.lineWidth = bolt.thickness;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.shadowBlur = 15;
            ctx.shadowColor = bolt.color;

            ctx.beginPath();
            for (let i = 0; i < segmentsToDraw; i++) {
              const segment = bolt.segments[i];
              if (i === 0) {
                ctx.moveTo(segment.x, segment.y);
              } else {
                ctx.lineTo(segment.x, segment.y);
              }
            }
            ctx.stroke();

            const drawBranch = (
              branch: LightningBranch,
              parentSegments: { x: number; y: number }[],
              parentSegmentsToDraw: number,
            ) => {
              if (branch.startIndex < parentSegmentsToDraw) {
                const startSegment = parentSegments[branch.startIndex];
                const segmentsPastBranch = parentSegmentsToDraw - branch.startIndex;
                const branchRevealProgress = Math.min(1, segmentsPastBranch / 3);
                const branchSegmentsToDraw = Math.ceil(
                  branch.segments.length * branchRevealProgress,
                );

                ctx.beginPath();
                ctx.moveTo(startSegment.x, startSegment.y);
                for (let i = 0; i < branchSegmentsToDraw; i++) {
                  const segment = branch.segments[i];
                  ctx.lineTo(segment.x, segment.y);
                }
                ctx.lineWidth = branch.thickness;
                ctx.stroke();

                if (branch.children && branch.children.length > 0) {
                  branch.children.forEach((childBranch) => {
                    drawBranch(childBranch, branch.segments, branchSegmentsToDraw);
                  });
                }
              }
            };

            bolt.branches.forEach((branch) => {
              drawBranch(branch, bolt.segments, segmentsToDraw);
            });

            ctx.shadowBlur = 0;
          });
        }

        ctx.globalAlpha = 1;
        animationRef.current = requestAnimationFrame(animate);
      };

      if (!shouldAnimate) {
        return () => {
          window.removeEventListener("resize", updateSize);
          if (resizeObserver) {
            resizeObserver.disconnect();
          }
        };
      }

      animate();

      return () => {
        window.removeEventListener("resize", updateSize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [type, colors, speed, intensity, angle, duration, trigger, shouldAnimate]);

    const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(e);
      if (trigger === "hover" && !isHoveredRef.current) {
        isHoveredRef.current = true;
        isEmittingRef.current = true;
        emitStartTimeRef.current = Date.now();

        if (particlesRef.current.length === 0) {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (canvas && container) {
            const cw = canvas.width / 2;
            const ch = canvas.height / 2;
            const parsedColors = resolveColors(container, colors);
            particlesRef.current = createParticles(
              type,
              cw,
              ch,
              parsedColors,
              intensity,
              speed,
              angle,
            );
          }
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
      if (trigger === "hover" && isHoveredRef.current) {
        isHoveredRef.current = false;
      }
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (trigger !== "click") return;

      if (!isEmittingRef.current) {
        if (particlesRef.current.length === 0) {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (canvas && container) {
            const cw = canvas.width / 2;
            const ch = canvas.height / 2;
            const parsedColors = resolveColors(container, colors);
            particlesRef.current = createParticles(
              type,
              cw,
              ch,
              parsedColors,
              intensity,
              speed,
              angle,
            );
          }
        }
        isEmittingRef.current = true;
        emitStartTimeRef.current = Date.now();
      } else {
        isEmittingRef.current = false;
      }
    };

    return (
      <Flex
        ref={containerRef}
        fill
        position="relative"
        overflow="hidden"
        cursor={trigger === "click" ? (cursor ?? "interactive") : cursor}
        className={cn(WEATHER_FX_BASE, className)}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...rest}
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" />
        {children}
      </Flex>
    );
  },
);

WeatherFx.displayName = "WeatherFx";

export { WeatherFx };

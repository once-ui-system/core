"use client";

import { cva } from "class-variance-authority";
import type { MouseEvent, ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "../classes/utils";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Flex, type FlexComponentProps } from "./Flex";

export const matrixFxVariants = cva("relative overflow-hidden w-full h-full");
const MATRIX_FX_BASE = matrixFxVariants();

const DEFAULT_COLORS = ["brand-solid-medium"];

export interface BulgeConfig {
  type?: "ripple" | "wave";
  duration?: number;
  intensity?: number;
  repeat?: boolean;
  delay?: number;
}

export type MatrixFxRevealFrom = "center" | "top" | "bottom" | "left" | "right";
export type MatrixFxTrigger = "hover" | "instant" | "mount" | "click" | "manual";

export interface MatrixFxProps extends FlexComponentProps {
  speed?: number;
  colors?: string[];
  size?: number;
  spacing?: number;
  revealFrom?: MatrixFxRevealFrom;
  trigger?: MatrixFxTrigger;
  active?: boolean;
  flicker?: boolean;
  bulge?: BulgeConfig;
  fps?: number;
  reducedMotion?: boolean | "auto";
  children?: ReactNode;
}

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
  gridSize?: number;
  canvasW?: number;
  canvasH?: number;
}

const MatrixFx = forwardRef<HTMLDivElement, MatrixFxProps>(
  (
    {
      speed = 1,
      colors = DEFAULT_COLORS,
      size = 3,
      spacing = 3,
      revealFrom = "center",
      trigger = "instant",
      active = false,
      flicker = false,
      bulge,
      fps = 60,
      reducedMotion = "auto",
      cursor,
      className,
      style,
      children,
      onClick,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const revealStartTimeRef = useRef<number>(Date.now());
    const hideStartTimeRef = useRef<number>(Date.now());
    const maxRevealProgressRef = useRef<number>(0);
    const hideStartProgressRef = useRef<number>(0);
    const isHoveredRef = useRef<boolean>(false);
    const mountAnimationCompleteRef = useRef<boolean>(false);
    const bulgeStartTimeRef = useRef<number>(Date.now());
    const dotsRef = useRef<Dot[]>([]);
    const lastFrameTimeRef = useRef<number>(0);
    const isStaticRef = useRef<boolean>(false);
    const isVisibleRef = useRef<boolean>(true);
    const animateFnRef = useRef<((time?: number) => void) | null>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Viewport visibility detection
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      if (typeof IntersectionObserver === "undefined") return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisibleRef.current = entry.isIntersecting;
          });
        },
        {
          // Start animating when 10% visible for smooth transitions
          threshold: 0.1,
          // Add margin to start rendering slightly before entering viewport
          rootMargin: "50px",
        },
      );

      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Set canvas size — skip until the container has layout (0×0 crashes getImageData)
      let canvasWidth = 0;
      let canvasHeight = 0;
      let initialized = false;
      let disposed = false;

      const applySize = (): boolean => {
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return false;
        }
        canvasWidth = rect.width;
        canvasHeight = rect.height;
        canvas.width = Math.floor(rect.width * 2);
        canvas.height = Math.floor(rect.height * 2);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(2, 2);
        return true;
      };

      const handleResize = () => {
        const prevW = canvasWidth;
        const prevH = canvasHeight;
        if (!applySize()) return;
        if (initialized && (prevW !== canvasWidth || prevH !== canvasHeight)) {
          dotsRef.current = [];
          isStaticRef.current = false;
        }
      };

      window.addEventListener("resize", handleResize);

      const setup = () => {
        if (disposed || initialized) return;
        if (!applySize()) return;
        initialized = true;

        // Parse colors - convert token names to CSS variables
        const parsedColors = colors.map((color) => {
          const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
          const trimmed = computedColor?.trim();
          return trimmed || color;
        });

        // Create dot grid with padding to prevent edge gaps during displacement
        const totalSize = size + spacing;
        const maxDisplacement = (bulge?.intensity ?? 10) * 2;
        const paddedWidth = canvasWidth + maxDisplacement * 2;
        const paddedHeight = canvasHeight + maxDisplacement * 2;
        const cols = Math.ceil(paddedWidth / totalSize);
        const rows = Math.ceil(paddedHeight / totalSize);

        let dots: Dot[] = dotsRef.current;
        let maxDistance = 0;

        if (
          dots.length === 0 ||
          dots[0]?.gridSize !== totalSize ||
          dots[0]?.canvasW !== canvasWidth ||
          dots[0]?.canvasH !== canvasHeight
        ) {
          dots = [];

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = col * totalSize + size / 2 - maxDisplacement;
              const y = row * totalSize + size / 2 - maxDisplacement;

              let distanceFromOrigin = 0;
              const centerX = canvasWidth / 2;
              const centerY = canvasHeight / 2;

              switch (revealFrom) {
                case "center": {
                  const dx = x - centerX;
                  const dy = y - centerY;
                  distanceFromOrigin = Math.sqrt(dx * dx + dy * dy);
                  break;
                }
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
                flickerPhase: Math.random() * Math.PI * 2,
                flickerSpeed: 0.8 + Math.random() * 0.4,
                gridSize: totalSize,
                canvasW: canvasWidth,
                canvasH: canvasHeight,
              });
            }
          }

          maxDistance = dots.length > 0 ? Math.max(...dots.map((d) => d.distanceFromOrigin)) : 0;
          dotsRef.current = dots;
        } else {
          dots.forEach((dot) => {
            dot.color = parsedColors[Math.floor(Math.random() * parsedColors.length)];
          });
          maxDistance = dots.length > 0 ? Math.max(...dots.map((d) => d.distanceFromOrigin)) : 0;
        }

        const startTime = Date.now();
        const frameInterval = 1000 / fps;

        const bulgeEnabled = !!bulge;
        const bulgeType = bulge?.type ?? "ripple";
        const bulgeDuration = bulge?.duration ?? 3;
        const bulgeIntensity = bulge?.intensity ?? 10;
        const bulgeRepeat = bulge?.repeat ?? true;
        const bulgeDelay = bulge?.delay ?? 0;

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        let cachedImageData: ImageData | null = null;

        const cacheStaticFrame = () => {
          if (canvas.width <= 0 || canvas.height <= 0) return;
          try {
            cachedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch {
            cachedImageData = null;
          }
        };

        // When reduced motion is active, force static rendering after first frame
        if (!shouldAnimate) {
          isStaticRef.current = true;
          mountAnimationCompleteRef.current = true;
        }

        const animate = (currentTime = 0) => {
          if (canvasWidth <= 0 || canvasHeight <= 0) {
            if (shouldAnimate) {
              animationRef.current = requestAnimationFrame(animate);
            }
            return;
          }

          // Skip rendering if not visible in viewport
          if (!isVisibleRef.current) {
            if (shouldAnimate) {
              animationRef.current = requestAnimationFrame(animate);
            }
            return;
          }

          // FPS throttling
          if (currentTime - lastFrameTimeRef.current < frameInterval) {
            if (shouldAnimate) {
              animationRef.current = requestAnimationFrame(animate);
            }
            return;
          }
          lastFrameTimeRef.current = currentTime;

          // If static and we have cached image, just render that and stop animating
          if (isStaticRef.current && cachedImageData) {
            ctx.putImageData(cachedImageData, 0, 0);
            return;
          }

          ctx.clearRect(0, 0, canvasWidth, canvasHeight);

          const time = (Date.now() - startTime) / 1000; // Time in seconds

          // Calculate circular wave radius (travels from center to edge)
          let waveProgress = 0;
          let showBulge = false;
          let bulgeFadeOut = 1; // Multiplier for fading out bulge effect (1 = full effect, 0 = no effect)
          if (bulgeEnabled) {
            const bulgeElapsed = (Date.now() - bulgeStartTimeRef.current) / 1000;
            const delaySeconds = bulgeDelay / 1000;
            const totalCycleDuration = bulgeDuration + delaySeconds;
            const adjustedTime = bulgeElapsed - delaySeconds;
            const fadeStartPercent = 0.6; // Start fading at 60% of wave duration

            if (adjustedTime >= 0) {
              showBulge = true;
              if (bulgeRepeat) {
                // Continuous repeating wave
                const cycleTime = adjustedTime % totalCycleDuration;
                waveProgress = cycleTime < bulgeDuration ? cycleTime / bulgeDuration : 0;
                showBulge = cycleTime < bulgeDuration; // Only show during active wave, not delay
              } else {
                // Single wave with opacity fade during last 40%
                if (adjustedTime <= bulgeDuration) {
                  waveProgress = adjustedTime / bulgeDuration;

                  // Start fading opacity at 60% of duration
                  if (waveProgress >= fadeStartPercent) {
                    const fadeProgress = (waveProgress - fadeStartPercent) / (1 - fadeStartPercent);
                    bulgeFadeOut = 1 - fadeProgress; // Fade from 1 to 0
                  }
                } else {
                  waveProgress = 0;
                  showBulge = false;
                }
              }
            }
          }
          const waveRadius = waveProgress * maxRadius * 1.5; // Travel beyond edges for smooth cycle

          // For instant trigger, show all dots immediately at full opacity
          if (trigger === "instant") {
            // Check if we're in a static state (no flicker, no active bulge)
            const isCurrentlyStatic = !shouldAnimate || (!flicker && (!bulgeEnabled || !showBulge));

            if (isCurrentlyStatic && isStaticRef.current && cachedImageData) {
              ctx.putImageData(cachedImageData, 0, 0);
            } else {
              dots.forEach((dot) => {
                ctx.fillStyle = dot.color;
                let opacity = dot.baseOpacity;

                // Apply flicker effect if enabled
                if (flicker && shouldAnimate) {
                  const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                  const flickerMultiplier = 0.6 + flickerValue * 0.4;
                  opacity *= flickerMultiplier;
                }

                // Calculate bulge displacement
                let offsetX = 0;
                let offsetY = 0;
                let sizeMultiplier = 1;
                let bulgeOpacity = 1;
                if (bulgeEnabled && showBulge && shouldAnimate) {
                  if (bulgeType === "ripple") {
                    const dx = dot.x - centerX;
                    const dy = dot.y - centerY;
                    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

                    const distanceToWave = Math.abs(distanceFromCenter - waveRadius);
                    const waveWidth = maxRadius * 0.15;
                    const distanceNorm = distanceToWave / waveWidth;

                    const waveFactor = Math.exp(-distanceNorm * distanceNorm * 4);

                    const angle = Math.atan2(dy, dx);
                    const displacementAmount = waveFactor * bulgeIntensity * bulgeFadeOut;
                    offsetX = Math.cos(angle) * displacementAmount;
                    offsetY = Math.sin(angle) * displacementAmount;

                    sizeMultiplier = 1 + waveFactor * 0.8 * bulgeFadeOut;

                    const waveOpacity = 0.3 + waveFactor * 0.7;
                    bulgeOpacity = 1 + (waveOpacity - 1) * bulgeFadeOut;
                  } else if (bulgeType === "wave") {
                    const diagonalLength = Math.sqrt(
                      canvasWidth * canvasWidth + canvasHeight * canvasHeight,
                    );
                    const wavePosOnDiagonal =
                      waveProgress * diagonalLength * 1.4 - diagonalLength * 0.2;

                    const normalizedX = dot.x / canvasWidth;
                    const normalizedY = 1 - dot.y / canvasHeight;
                    const dotDiagonalPos = ((normalizedX + normalizedY) / 2) * diagonalLength;

                    const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                    const waveWidth = diagonalLength * 0.25;
                    const distanceNorm = distanceToWaveFront / waveWidth;

                    const waveFactor = Math.exp(-distanceNorm * distanceNorm * 2.5);

                    const perpendicularOffset = normalizedY - normalizedX;

                    const rotationPhase = waveProgress * Math.PI * 3;
                    const primaryFreq = 3;
                    const sCurvePrimary = Math.sin(
                      perpendicularOffset * Math.PI * primaryFreq + rotationPhase,
                    );

                    const secondaryFreq = 7;
                    const sCurveSecondary =
                      Math.sin(
                        perpendicularOffset * Math.PI * secondaryFreq - rotationPhase * 1.5,
                      ) * 0.4;

                    const sCurveFactor = sCurvePrimary + sCurveSecondary;

                    const curveStrength = 1 - Math.abs(distanceNorm) * 0.5;
                    const modulatedCurve = sCurveFactor * curveStrength;

                    const baseDisplacement = waveFactor * bulgeIntensity * bulgeFadeOut;
                    const diagonalAngle = Math.PI / 4;

                    const perpAngle = diagonalAngle + Math.PI / 2;

                    offsetX =
                      Math.cos(diagonalAngle) * baseDisplacement +
                      Math.cos(perpAngle) * modulatedCurve * baseDisplacement * 0.8;
                    offsetY =
                      -Math.sin(diagonalAngle) * baseDisplacement -
                      Math.sin(perpAngle) * modulatedCurve * baseDisplacement * 0.8;

                    sizeMultiplier = 1 + waveFactor * 0.5 * bulgeFadeOut;

                    const waveOpacity = 0.4 + waveFactor * 0.6;
                    bulgeOpacity = 1 + (waveOpacity - 1) * bulgeFadeOut;
                  }
                }

                ctx.globalAlpha = opacity * bulgeOpacity;
                const adjustedSize = size * sizeMultiplier;
                const sizeOffset = (adjustedSize - size) / 2;
                ctx.fillRect(
                  dot.x + offsetX - sizeOffset,
                  dot.y + offsetY - sizeOffset,
                  adjustedSize,
                  adjustedSize,
                );
              });

              if (isCurrentlyStatic) {
                cacheStaticFrame();
                isStaticRef.current = true;
              }
            }
            ctx.globalAlpha = 1;

            if (!isCurrentlyStatic && shouldAnimate) {
              animationRef.current = requestAnimationFrame(animate);
            } else {
              animationRef.current = undefined;
            }
            return;
          }

          // For mount trigger - progressive reveal on load, then static
          if (trigger === "mount") {
            if (!mountAnimationCompleteRef.current && shouldAnimate) {
              const now = Date.now();
              const elapsed = (now - revealStartTimeRef.current) / 1000;
              const revealProgress = elapsed ** 3 * speed * 3;

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

                  if (flicker) {
                    const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                    const flickerMultiplier = 0.6 + flickerValue * 0.4;
                    opacity *= flickerMultiplier;
                  }
                }

                if (opacity > 0) {
                  let offsetX = 0;
                  let offsetY = 0;
                  let sizeMultiplier = 1;
                  let bulgeOpacity = 1;
                  if (bulgeEnabled) {
                    if (bulgeType === "ripple") {
                      const dx = dot.x - centerX;
                      const dy = dot.y - centerY;
                      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                      const distanceToWave = Math.abs(distanceFromCenter - waveRadius);
                      const waveWidth = maxRadius * 0.15;
                      const distanceNorm = distanceToWave / waveWidth;
                      const waveFactor = Math.exp(-distanceNorm * distanceNorm * 4);
                      const angle = Math.atan2(dy, dx);
                      const displacementAmount = waveFactor * bulgeIntensity;
                      offsetX = Math.cos(angle) * displacementAmount;
                      offsetY = Math.sin(angle) * displacementAmount;
                      sizeMultiplier = 1 + waveFactor * 0.8;
                      bulgeOpacity = 0.3 + waveFactor * 0.7;
                    } else if (bulgeType === "wave") {
                      const diagonalLength = Math.sqrt(
                        canvasWidth * canvasWidth + canvasHeight * canvasHeight,
                      );
                      const wavePosOnDiagonal = waveProgress * diagonalLength * 1.2;
                      const normalizedX = dot.x / canvasWidth;
                      const normalizedY = 1 - dot.y / canvasHeight;
                      const dotDiagonalPos = ((normalizedX + normalizedY) / 2) * diagonalLength;
                      const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                      const waveWidth = diagonalLength * 0.2;
                      const distanceNorm = Math.abs(distanceToWaveFront) / waveWidth;
                      const waveFactor = Math.exp(-distanceNorm * distanceNorm * 3);
                      const perpendicularOffset = normalizedY - normalizedX;
                      const sCurvePhase = perpendicularOffset * Math.PI * 2;
                      const sCurveFactor = Math.sin(sCurvePhase + waveProgress * Math.PI * 2);
                      const baseDisplacement = waveFactor * bulgeIntensity;
                      const diagonalAngle = Math.PI / 4;
                      offsetX =
                        Math.cos(diagonalAngle) * baseDisplacement +
                        sCurveFactor * baseDisplacement * 0.5;
                      offsetY =
                        -Math.sin(diagonalAngle) * baseDisplacement +
                        sCurveFactor * baseDisplacement * 0.5;
                      sizeMultiplier = 1 + waveFactor * 0.6;
                      bulgeOpacity = 0.4 + waveFactor * 0.6;
                    }
                  }

                  ctx.fillStyle = dot.color;
                  ctx.globalAlpha = opacity * bulgeOpacity;
                  const adjustedSize = size * sizeMultiplier;
                  const sizeOffset = (adjustedSize - size) / 2;
                  ctx.fillRect(
                    dot.x + offsetX - sizeOffset,
                    dot.y + offsetY - sizeOffset,
                    adjustedSize,
                    adjustedSize,
                  );
                }
              });
            } else {
              const isCurrentlyStatic =
                !shouldAnimate || (!flicker && (!bulgeEnabled || !showBulge));

              if (isCurrentlyStatic && isStaticRef.current && cachedImageData) {
                ctx.putImageData(cachedImageData, 0, 0);
              } else {
                dots.forEach((dot) => {
                  ctx.fillStyle = dot.color;
                  let opacity = dot.baseOpacity;

                  if (flicker && shouldAnimate) {
                    const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                    const flickerMultiplier = 0.6 + flickerValue * 0.4;
                    opacity *= flickerMultiplier;
                  }

                  let offsetX = 0;
                  let offsetY = 0;
                  let sizeMultiplier = 1;
                  let bulgeOpacity = 1;
                  if (bulgeEnabled && shouldAnimate) {
                    if (bulgeType === "ripple") {
                      const dx = dot.x - centerX;
                      const dy = dot.y - centerY;
                      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                      const distanceToWave = Math.abs(distanceFromCenter - waveRadius);
                      const waveWidth = maxRadius * 0.15;
                      const distanceNorm = distanceToWave / waveWidth;
                      const waveFactor = Math.exp(-distanceNorm * distanceNorm * 4);
                      const angle = Math.atan2(dy, dx);
                      const displacementAmount = waveFactor * bulgeIntensity;
                      offsetX = Math.cos(angle) * displacementAmount;
                      offsetY = Math.sin(angle) * displacementAmount;
                      sizeMultiplier = 1 + waveFactor * 0.8;
                      bulgeOpacity = 0.3 + waveFactor * 0.7;
                    } else if (bulgeType === "wave") {
                      const diagonalLength = Math.sqrt(
                        canvasWidth * canvasWidth + canvasHeight * canvasHeight,
                      );
                      const wavePosOnDiagonal = waveProgress * diagonalLength * 1.2;
                      const normalizedX = dot.x / canvasWidth;
                      const normalizedY = 1 - dot.y / canvasHeight;
                      const dotDiagonalPos = ((normalizedX + normalizedY) / 2) * diagonalLength;
                      const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                      const waveWidth = diagonalLength * 0.2;
                      const distanceNorm = Math.abs(distanceToWaveFront) / waveWidth;
                      const waveFactor = Math.exp(-distanceNorm * distanceNorm * 3);
                      const perpendicularOffset = normalizedY - normalizedX;
                      const sCurvePhase = perpendicularOffset * Math.PI * 2;
                      const sCurveFactor = Math.sin(sCurvePhase + waveProgress * Math.PI * 2);
                      const baseDisplacement = waveFactor * bulgeIntensity;
                      const diagonalAngle = Math.PI / 4;
                      offsetX =
                        Math.cos(diagonalAngle) * baseDisplacement +
                        sCurveFactor * baseDisplacement * 0.5;
                      offsetY =
                        -Math.sin(diagonalAngle) * baseDisplacement +
                        sCurveFactor * baseDisplacement * 0.5;
                      sizeMultiplier = 1 + waveFactor * 0.6;
                      bulgeOpacity = 0.4 + waveFactor * 0.6;
                    }
                  }

                  ctx.globalAlpha = opacity * bulgeOpacity;
                  const adjustedSize = size * sizeMultiplier;
                  const sizeOffset = (adjustedSize - size) / 2;
                  ctx.fillRect(
                    dot.x + offsetX - sizeOffset,
                    dot.y + offsetY - sizeOffset,
                    adjustedSize,
                    adjustedSize,
                  );
                });

                if (isCurrentlyStatic) {
                  cacheStaticFrame();
                  isStaticRef.current = true;
                }
              }
            }

            ctx.globalAlpha = 1;

            const isCurrentlyStatic =
              !shouldAnimate ||
              (mountAnimationCompleteRef.current && !flicker && (!bulgeEnabled || !showBulge));
            if (!isCurrentlyStatic && shouldAnimate) {
              animationRef.current = requestAnimationFrame(animate);
            } else {
              animationRef.current = undefined;
            }
            return;
          }

          // For hover, click, and manual triggers with animation
          if (trigger === "hover" || trigger === "click" || trigger === "manual") {
            if (isHoveredRef.current) {
              const now = Date.now();
              const elapsed = (now - revealStartTimeRef.current) / 1000;
              const revealProgress = elapsed ** 3 * speed * 3;
              const cappedProgress = Math.min(revealProgress, 2.0);
              maxRevealProgressRef.current = cappedProgress;

              dots.forEach((dot) => {
                const normalizedDistance = dot.distanceFromOrigin / maxDistance;
                const introOffset = normalizedDistance * 0.8 + dot.randomOffset * 0.5;

                let opacity = 0;
                if (cappedProgress > introOffset) {
                  const fadeIn = (cappedProgress - introOffset) * 8;
                  opacity = Math.min(1, fadeIn * fadeIn) * dot.baseOpacity;

                  if (flicker && shouldAnimate) {
                    const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                    const flickerMultiplier = 0.6 + flickerValue * 0.4;
                    opacity *= flickerMultiplier;
                  }
                }

                if (opacity > 0) {
                  let offsetX = 0;
                  let offsetY = 0;
                  let sizeMultiplier = 1;
                  let bulgeOpacity = 1;
                  if (bulgeEnabled && shouldAnimate) {
                    if (bulgeType === "ripple") {
                      const dx = dot.x - centerX;
                      const dy = dot.y - centerY;
                      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                      const distanceToWave = Math.abs(distanceFromCenter - waveRadius);
                      const waveWidth = maxRadius * 0.15;
                      const distanceNorm = distanceToWave / waveWidth;
                      const waveFactor = Math.exp(-distanceNorm * distanceNorm * 4);
                      const angle = Math.atan2(dy, dx);
                      const displacementAmount = waveFactor * bulgeIntensity;
                      offsetX = Math.cos(angle) * displacementAmount;
                      offsetY = Math.sin(angle) * displacementAmount;
                      sizeMultiplier = 1 + waveFactor * 0.8;
                      bulgeOpacity = 0.3 + waveFactor * 0.7;
                    } else if (bulgeType === "wave") {
                      const diagonalLength = Math.sqrt(
                        canvasWidth * canvasWidth + canvasHeight * canvasHeight,
                      );
                      const wavePosOnDiagonal = waveProgress * diagonalLength * 1.2;
                      const normalizedX = dot.x / canvasWidth;
                      const normalizedY = 1 - dot.y / canvasHeight;
                      const dotDiagonalPos = ((normalizedX + normalizedY) / 2) * diagonalLength;
                      const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                      const waveWidth = diagonalLength * 0.2;
                      const distanceNorm = Math.abs(distanceToWaveFront) / waveWidth;
                      const waveFactor = Math.exp(-distanceNorm * distanceNorm * 3);
                      const perpendicularOffset = normalizedY - normalizedX;
                      const sCurvePhase = perpendicularOffset * Math.PI * 2;
                      const sCurveFactor = Math.sin(sCurvePhase + waveProgress * Math.PI * 2);
                      const baseDisplacement = waveFactor * bulgeIntensity;
                      const diagonalAngle = Math.PI / 4;
                      offsetX =
                        Math.cos(diagonalAngle) * baseDisplacement +
                        sCurveFactor * baseDisplacement * 0.5;
                      offsetY =
                        -Math.sin(diagonalAngle) * baseDisplacement +
                        sCurveFactor * baseDisplacement * 0.5;
                      sizeMultiplier = 1 + waveFactor * 0.6;
                      bulgeOpacity = 0.4 + waveFactor * 0.6;
                    }
                  }

                  ctx.fillStyle = dot.color;
                  ctx.globalAlpha = opacity * bulgeOpacity;
                  const adjustedSize = size * sizeMultiplier;
                  const sizeOffset = (adjustedSize - size) / 2;
                  ctx.fillRect(
                    dot.x + offsetX - sizeOffset,
                    dot.y + offsetY - sizeOffset,
                    adjustedSize,
                    adjustedSize,
                  );
                }
              });
            } else {
              if (hideStartProgressRef.current > 0) {
                const elapsed = (Date.now() - hideStartTimeRef.current) / 1000;
                const hideSpeed = speed * 6;
                const hideProgress = elapsed ** 2 * hideSpeed;
                const reverseProgress = Math.max(0, hideStartProgressRef.current - hideProgress);

                if (reverseProgress > 0.01) {
                  dots.forEach((dot) => {
                    const normalizedDistance = dot.distanceFromOrigin / maxDistance;
                    const introOffset = normalizedDistance * 0.8 + dot.randomOffset * 0.5;

                    let opacity = 0;
                    if (reverseProgress > introOffset) {
                      const fadeIn = (reverseProgress - introOffset) * 8;
                      opacity = Math.min(1, fadeIn * fadeIn) * dot.baseOpacity;

                      if (flicker && shouldAnimate) {
                        const flickerValue = Math.sin(
                          time * dot.flickerSpeed * 3 + dot.flickerPhase,
                        );
                        const flickerMultiplier = 0.6 + flickerValue * 0.4;
                        opacity *= flickerMultiplier;
                      }
                    }

                    if (opacity > 0) {
                      let offsetX = 0;
                      let offsetY = 0;
                      let sizeMultiplier = 1;
                      let bulgeOpacity = 1;
                      if (bulgeEnabled && shouldAnimate) {
                        const dx = dot.x - centerX;
                        const dy = dot.y - centerY;
                        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                        const distanceToWave = Math.abs(distanceFromCenter - waveRadius);
                        const waveWidth = maxRadius * 0.15;
                        const distanceNorm = distanceToWave / waveWidth;
                        const waveFactor = Math.exp(-distanceNorm * distanceNorm * 4);
                        const angle = Math.atan2(dy, dx);
                        const displacementAmount = waveFactor * bulgeIntensity;
                        offsetX = Math.cos(angle) * displacementAmount * 0.3;
                        offsetY =
                          Math.sin(angle) * displacementAmount * 0.3 - waveFactor * bulgeIntensity;
                        sizeMultiplier = 1 + waveFactor * 0.8;
                        bulgeOpacity = 0.3 + waveFactor * 0.7;
                      }

                      ctx.fillStyle = dot.color;
                      ctx.globalAlpha = opacity * bulgeOpacity;
                      const adjustedSize = size * sizeMultiplier;
                      const sizeOffset = (adjustedSize - size) / 2;
                      ctx.fillRect(
                        dot.x + offsetX - sizeOffset,
                        dot.y + offsetY - sizeOffset,
                        adjustedSize,
                        adjustedSize,
                      );
                    }
                  });
                } else {
                  hideStartProgressRef.current = 0;
                }
              }
            }
          }

          ctx.globalAlpha = 1;

          const hasActiveAnimation = isHoveredRef.current || hideStartProgressRef.current > 0;
          const hasDynamicContent = flicker || (bulgeEnabled && showBulge);
          if ((hasActiveAnimation || hasDynamicContent) && shouldAnimate) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            animationRef.current = undefined;
          }
        };

        animateFnRef.current = animate;
        animate();
      };

      setup();

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          if (!initialized) {
            setup();
          } else {
            handleResize();
          }
        });
        resizeObserver.observe(container);
      }

      return () => {
        disposed = true;
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        window.removeEventListener("resize", handleResize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [colors, size, spacing, speed, revealFrom, trigger, flicker, bulge, fps, shouldAnimate]);

    // Manual trigger control via `active` prop
    useEffect(() => {
      if (trigger !== "manual") return;
      const now = Date.now();
      if (active) {
        // Mimic mouse enter
        if (hideStartProgressRef.current > 0) {
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = speed * 6;
          const hideProgress = hideElapsed ** 2 * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          const effectiveElapsed = (currentProgress / (speed * 3)) ** (1 / 3);
          const simulatedStartTime = now - effectiveElapsed * 1000;
          revealStartTimeRef.current = simulatedStartTime;
        } else {
          revealStartTimeRef.current = now;
        }
        if (bulge && !bulge.repeat) {
          bulgeStartTimeRef.current = now;
        }
        isHoveredRef.current = true;
        hideStartProgressRef.current = 0;
        isStaticRef.current = false; // Invalidate cache

        // Restart animation loop if it was stopped
        if (!animationRef.current && animateFnRef.current && shouldAnimate) {
          animationRef.current = requestAnimationFrame(animateFnRef.current);
        }
      } else {
        // Mimic mouse leave
        if (isHoveredRef.current) {
          const currentProgress = maxRevealProgressRef.current;
          hideStartTimeRef.current = Date.now();
          hideStartProgressRef.current = currentProgress;
          isHoveredRef.current = false;

          // Restart animation loop if it was stopped (for hide animation)
          if (!animationRef.current && animateFnRef.current && shouldAnimate) {
            animationRef.current = requestAnimationFrame(animateFnRef.current);
          }
        }
      }
    }, [active, trigger, speed, bulge, shouldAnimate]);

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);
      if (trigger === "hover" && !isHoveredRef.current) {
        const now = Date.now();

        // If we're currently hiding, resume from where we left off
        if (hideStartProgressRef.current > 0) {
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = speed * 6;
          const hideProgress = hideElapsed ** 2 * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          const effectiveElapsed = (currentProgress / (speed * 3)) ** (1 / 3);
          const simulatedStartTime = now - effectiveElapsed * 1000;
          revealStartTimeRef.current = simulatedStartTime;
        } else {
          revealStartTimeRef.current = now;
        }

        // Reset bulge animation on each hover when repeat is false
        if (bulge && !bulge.repeat) {
          bulgeStartTimeRef.current = now;
        }

        isHoveredRef.current = true;
        hideStartProgressRef.current = 0; // Clear hide state
        isStaticRef.current = false; // Invalidate cache

        // Restart animation loop if it was stopped
        if (!animationRef.current && animateFnRef.current && shouldAnimate) {
          animationRef.current = requestAnimationFrame(animateFnRef.current);
        }
      }
    };

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(event);
      // Recovery mechanism: if cursor is moving over the element but we're not in hover state, trigger it
      if (trigger === "hover" && !isHoveredRef.current) {
        handleMouseEnter(event);
      }
    };

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event);
      if (trigger === "hover" && isHoveredRef.current) {
        const currentProgress = maxRevealProgressRef.current;
        hideStartTimeRef.current = Date.now();
        hideStartProgressRef.current = currentProgress; // Capture current progress
        isHoveredRef.current = false;

        // Restart animation loop if it was stopped (for hide animation)
        if (!animationRef.current && animateFnRef.current && shouldAnimate) {
          animationRef.current = requestAnimationFrame(animateFnRef.current);
        }
      }
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (trigger !== "click") return;
      if (!isHoveredRef.current) {
        // Enter
        const now = Date.now();
        if (hideStartProgressRef.current > 0) {
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = speed * 6;
          const hideProgress = hideElapsed ** 2 * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          const effectiveElapsed = (currentProgress / (speed * 3)) ** (1 / 3);
          const simulatedStartTime = now - effectiveElapsed * 1000;
          revealStartTimeRef.current = simulatedStartTime;
        } else {
          revealStartTimeRef.current = now;
        }
        if (bulge && !bulge.repeat) {
          bulgeStartTimeRef.current = now;
        }
        isHoveredRef.current = true;
        hideStartProgressRef.current = 0;
        isStaticRef.current = false; // Invalidate cache

        // Restart animation loop if it was stopped
        if (!animationRef.current && animateFnRef.current && shouldAnimate) {
          animationRef.current = requestAnimationFrame(animateFnRef.current);
        }
      } else {
        // Leave
        const currentProgress = maxRevealProgressRef.current;
        hideStartTimeRef.current = Date.now();
        hideStartProgressRef.current = currentProgress;
        isHoveredRef.current = false;

        // Restart animation loop if it was stopped (for hide animation)
        if (!animationRef.current && animateFnRef.current && shouldAnimate) {
          animationRef.current = requestAnimationFrame(animateFnRef.current);
        }
      }
    };

    return (
      <Flex
        ref={containerRef}
        fill
        position="relative"
        overflow="hidden"
        cursor={trigger === "click" ? (cursor ?? "interactive") : cursor}
        className={cn(MATRIX_FX_BASE, className)}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
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

MatrixFx.displayName = "MatrixFx";

export { MatrixFx };

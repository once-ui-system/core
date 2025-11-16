"use client";

import React, { useEffect, useRef } from "react";
import { Flex } from ".";

interface BulgeConfig {
  type?: "ripple" | "wave";
  duration?: number;
  intensity?: number;
  repeat?: boolean;
  delay?: number;
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

interface MatrixFxProps extends React.ComponentProps<typeof Flex> {
  speed?: number;
  colors?: string[];
  size?: number;
  spacing?: number;
  revealFrom?: "center" | "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "instant" | "mount" | "click" | "manual";
  active?: boolean;
  flicker?: boolean;
  bulge?: BulgeConfig;
  children?: React.ReactNode;
}

const MatrixFx = React.forwardRef<HTMLDivElement, MatrixFxProps>(
  (
    {
      speed = 1,
      colors = ["brand-solid-medium"],
      size = 3,
      spacing = 3,
      revealFrom = "center",
      trigger = "instant",
      active = false,
      flicker = false,
      bulge,
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
    const bulgeStartTimeRef = useRef<number>(Date.now());
    const dotsRef = useRef<Dot[]>([]);

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

      // Create dot grid with padding to prevent edge gaps during displacement
      const totalSize = size + spacing;
      const maxDisplacement = (bulge?.intensity ?? 10) * 2; // Account for max possible displacement
      const paddedWidth = canvasWidth + maxDisplacement * 2;
      const paddedHeight = canvasHeight + maxDisplacement * 2;
      const cols = Math.ceil(paddedWidth / totalSize);
      const rows = Math.ceil(paddedHeight / totalSize);

      // Only create new dots if grid doesn't exist or dimensions/size changed
      let dots: Dot[] = dotsRef.current;
      let maxDistance = 0;

      if (dots.length === 0 || dots[0]?.gridSize !== totalSize || dots[0]?.canvasW !== canvasWidth || dots[0]?.canvasH !== canvasHeight) {
        // Create new dot grid
        dots = [];

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * totalSize + size / 2 - maxDisplacement;
            const y = row * totalSize + size / 2 - maxDisplacement;

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
              flickerPhase: Math.random() * Math.PI * 2,
              flickerSpeed: 0.8 + Math.random() * 0.4,
              gridSize: totalSize,
              canvasW: canvasWidth,
              canvasH: canvasHeight,
            });
          }
        }

        // Find max distance for normalization
        maxDistance = Math.max(...dots.map((d) => d.distanceFromOrigin));
        dotsRef.current = dots;
      } else {
        // Update colors on existing dots
        dots.forEach((dot) => {
          dot.color = parsedColors[Math.floor(Math.random() * parsedColors.length)];
        });
        maxDistance = Math.max(...dots.map((d) => d.distanceFromOrigin));
      }


      // Animation loop
      const startTime = Date.now();
      
      // Bulge configuration
      const bulgeEnabled = !!bulge;
      const bulgeType = bulge?.type ?? "ripple"; // Default: ripple
      const bulgeDuration = bulge?.duration ?? 3; // Default: 3 seconds per wave
      const bulgeIntensity = bulge?.intensity ?? 10; // Default: 10px displacement
      const bulgeRepeat = bulge?.repeat ?? true; // Default: true
      const bulgeDelay = bulge?.delay ?? 0; // Default: 0ms
      
      // Calculate center point for circular wave
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
      
      const animate = () => {
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
          dots.forEach((dot) => {
            ctx.fillStyle = dot.color;
            let opacity = dot.baseOpacity;
            
            // Apply flicker effect if enabled
            if (flicker) {
              const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
              const flickerMultiplier = 0.6 + (flickerValue * 0.4); // Oscillate between 0.6 and 1.0
              opacity *= flickerMultiplier;
            }
            
            // Calculate bulge displacement
            let offsetX = 0;
            let offsetY = 0;
            let sizeMultiplier = 1;
            let bulgeOpacity = 1;
            if (bulgeEnabled && showBulge) {
              if (bulgeType === "ripple") {
                // Ripple: circular wave from center
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
                // Wave: Organic S-curve from bottom-left to top-right with rotation
                const diagonalLength = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
                // Start wave off-screen before bottom-left, end off-screen after top-right
                const wavePosOnDiagonal = (waveProgress * diagonalLength * 1.4) - (diagonalLength * 0.2);
                
                // Calculate distance along the diagonal (from bottom-left to top-right)
                const normalizedX = dot.x / canvasWidth;
                const normalizedY = 1 - (dot.y / canvasHeight);
                const dotDiagonalPos = (normalizedX + normalizedY) / 2 * diagonalLength;
                
                // Distance from wave front
                const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                const waveWidth = diagonalLength * 0.25;
                const distanceNorm = distanceToWaveFront / waveWidth;
                
                // Smooth wave factor with wider influence
                const waveFactor = Math.exp(-distanceNorm * distanceNorm * 2.5);
                
                // Create rotating S-curve with multiple frequency components
                const perpendicularOffset = normalizedY - normalizedX;
                
                // Primary S-curve that rotates over time
                const rotationPhase = waveProgress * Math.PI * 3; // Rotates 1.5 times during animation
                const primaryFreq = 3; // Number of S-curves along the wave
                const sCurvePrimary = Math.sin(perpendicularOffset * Math.PI * primaryFreq + rotationPhase);
                
                // Secondary curve for complexity (higher frequency, lower amplitude)
                const secondaryFreq = 7;
                const sCurveSecondary = Math.sin(perpendicularOffset * Math.PI * secondaryFreq - rotationPhase * 1.5) * 0.4;
                
                // Combine curves for organic motion
                const sCurveFactor = sCurvePrimary + sCurveSecondary;
                
                // Wave straightens at the edges (distanceNorm affects curve strength)
                const curveStrength = 1 - Math.abs(distanceNorm) * 0.5;
                const modulatedCurve = sCurveFactor * curveStrength;
                
                // Apply displacement
                const baseDisplacement = waveFactor * bulgeIntensity * bulgeFadeOut;
                const diagonalAngle = Math.PI / 4;
                
                // Perpendicular displacement creates the S-curve
                const perpAngle = diagonalAngle + Math.PI / 2;
                
                offsetX = Math.cos(diagonalAngle) * baseDisplacement + Math.cos(perpAngle) * modulatedCurve * baseDisplacement * 0.8;
                offsetY = -Math.sin(diagonalAngle) * baseDisplacement - Math.sin(perpAngle) * modulatedCurve * baseDisplacement * 0.8;
                
                sizeMultiplier = 1 + waveFactor * 0.5 * bulgeFadeOut;
                
                const waveOpacity = 0.4 + waveFactor * 0.6;
                bulgeOpacity = 1 + (waveOpacity - 1) * bulgeFadeOut;
              }
            }
            
            ctx.globalAlpha = opacity * bulgeOpacity;
            const adjustedSize = size * sizeMultiplier;
            const sizeOffset = (adjustedSize - size) / 2;
            ctx.fillRect(dot.x + offsetX - sizeOffset, dot.y + offsetY - sizeOffset, adjustedSize, adjustedSize);
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
            const revealProgress = Math.pow(elapsed, 3) * speed * 3;
            
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
                
                // Apply flicker effect if enabled
                if (flicker) {
                  const flickerValue = Math.sin(time * dot.flickerSpeed * 3 + dot.flickerPhase);
                  const flickerMultiplier = 0.6 + (flickerValue * 0.4);
                  opacity *= flickerMultiplier;
                }
              }

              if (opacity > 0) {
                // Calculate bulge displacement
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
                    const diagonalLength = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
                    const wavePosOnDiagonal = waveProgress * diagonalLength * 1.2;
                    const normalizedX = dot.x / canvasWidth;
                    const normalizedY = 1 - (dot.y / canvasHeight);
                    const dotDiagonalPos = (normalizedX + normalizedY) / 2 * diagonalLength;
                    const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                    const waveWidth = diagonalLength * 0.2;
                    const distanceNorm = Math.abs(distanceToWaveFront) / waveWidth;
                    const waveFactor = Math.exp(-distanceNorm * distanceNorm * 3);
                    const perpendicularOffset = normalizedY - normalizedX;
                    const sCurvePhase = perpendicularOffset * Math.PI * 2;
                    const sCurveFactor = Math.sin(sCurvePhase + waveProgress * Math.PI * 2);
                    const baseDisplacement = waveFactor * bulgeIntensity;
                    const diagonalAngle = Math.PI / 4;
                    offsetX = Math.cos(diagonalAngle) * baseDisplacement + sCurveFactor * baseDisplacement * 0.5;
                    offsetY = -Math.sin(diagonalAngle) * baseDisplacement + sCurveFactor * baseDisplacement * 0.5;
                    sizeMultiplier = 1 + waveFactor * 0.6;
                    bulgeOpacity = 0.4 + waveFactor * 0.6;
                  }
                }
                
                ctx.fillStyle = dot.color;
                ctx.globalAlpha = opacity * bulgeOpacity;
                const adjustedSize = size * sizeMultiplier;
                const sizeOffset = (adjustedSize - size) / 2;
                ctx.fillRect(dot.x + offsetX - sizeOffset, dot.y + offsetY - sizeOffset, adjustedSize, adjustedSize);
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
              
              // Calculate bulge displacement
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
                  const diagonalLength = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
                  const wavePosOnDiagonal = waveProgress * diagonalLength * 1.2;
                  const normalizedX = dot.x / canvasWidth;
                  const normalizedY = 1 - (dot.y / canvasHeight);
                  const dotDiagonalPos = (normalizedX + normalizedY) / 2 * diagonalLength;
                  const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                  const waveWidth = diagonalLength * 0.2;
                  const distanceNorm = Math.abs(distanceToWaveFront) / waveWidth;
                  const waveFactor = Math.exp(-distanceNorm * distanceNorm * 3);
                  const perpendicularOffset = normalizedY - normalizedX;
                  const sCurvePhase = perpendicularOffset * Math.PI * 2;
                  const sCurveFactor = Math.sin(sCurvePhase + waveProgress * Math.PI * 2);
                  const baseDisplacement = waveFactor * bulgeIntensity;
                  const diagonalAngle = Math.PI / 4;
                  offsetX = Math.cos(diagonalAngle) * baseDisplacement + sCurveFactor * baseDisplacement * 0.5;
                  offsetY = -Math.sin(diagonalAngle) * baseDisplacement + sCurveFactor * baseDisplacement * 0.5;
                  sizeMultiplier = 1 + waveFactor * 0.6;
                  bulgeOpacity = 0.4 + waveFactor * 0.6;
                }
              }
              
              ctx.globalAlpha = opacity * bulgeOpacity;
              const adjustedSize = size * sizeMultiplier;
              const sizeOffset = (adjustedSize - size) / 2;
              ctx.fillRect(dot.x + offsetX - sizeOffset, dot.y + offsetY - sizeOffset, adjustedSize, adjustedSize);
            });
          }
          
          ctx.globalAlpha = 1;
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // For hover, click, and manual triggers with animation
        if (trigger === "hover" || trigger === "click" || trigger === "manual") {
          if (isHoveredRef.current) {
            // Revealing animation with explosive easing
          const now = Date.now();
          const elapsed = (now - revealStartTimeRef.current) / 1000;
          // Cubic easing: starts very slow, then explodes
          const revealProgress = Math.pow(elapsed, 3) * speed * 3;
          
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
              // Calculate bulge displacement
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
                  const diagonalLength = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
                  const wavePosOnDiagonal = waveProgress * diagonalLength * 1.2;
                  const normalizedX = dot.x / canvasWidth;
                  const normalizedY = 1 - (dot.y / canvasHeight);
                  const dotDiagonalPos = (normalizedX + normalizedY) / 2 * diagonalLength;
                  const distanceToWaveFront = dotDiagonalPos - wavePosOnDiagonal;
                  const waveWidth = diagonalLength * 0.2;
                  const distanceNorm = Math.abs(distanceToWaveFront) / waveWidth;
                  const waveFactor = Math.exp(-distanceNorm * distanceNorm * 3);
                  const perpendicularOffset = normalizedY - normalizedX;
                  const sCurvePhase = perpendicularOffset * Math.PI * 2;
                  const sCurveFactor = Math.sin(sCurvePhase + waveProgress * Math.PI * 2);
                  const baseDisplacement = waveFactor * bulgeIntensity;
                  const diagonalAngle = Math.PI / 4;
                  offsetX = Math.cos(diagonalAngle) * baseDisplacement + sCurveFactor * baseDisplacement * 0.5;
                  offsetY = -Math.sin(diagonalAngle) * baseDisplacement + sCurveFactor * baseDisplacement * 0.5;
                  sizeMultiplier = 1 + waveFactor * 0.6;
                  bulgeOpacity = 0.4 + waveFactor * 0.6;
                }
              }
              
              ctx.fillStyle = dot.color;
              ctx.globalAlpha = opacity * bulgeOpacity;
              const adjustedSize = size * sizeMultiplier;
              const sizeOffset = (adjustedSize - size) / 2;
              ctx.fillRect(dot.x + offsetX - sizeOffset, dot.y + offsetY - sizeOffset, adjustedSize, adjustedSize);
            }
          });

        } else {
          // Reverse animation when hover ends - only run if there's something to hide
          if (hideStartProgressRef.current > 0) {
            const elapsed = (Date.now() - hideStartTimeRef.current) / 1000;
            // Use quadratic easing for faster hide (power of 2)
            const hideSpeed = speed * 6; // Faster to handle max progress of 2.0
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
                  // Calculate bulge displacement
                  let offsetX = 0;
                  let offsetY = 0;
                  let sizeMultiplier = 1;
                  let bulgeOpacity = 1;
                  if (bulgeEnabled) {
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
                    offsetY = Math.sin(angle) * displacementAmount * 0.3 - waveFactor * bulgeIntensity;
                    sizeMultiplier = 1 + waveFactor * 0.8;
                    bulgeOpacity = 0.3 + waveFactor * 0.7;
                  }
                  
                  ctx.fillStyle = dot.color;
                  ctx.globalAlpha = opacity * bulgeOpacity;
                  const adjustedSize = size * sizeMultiplier;
                  const sizeOffset = (adjustedSize - size) / 2;
                  ctx.fillRect(dot.x + offsetX - sizeOffset, dot.y + offsetY - sizeOffset, adjustedSize, adjustedSize);
                }
              });
            } else {
              // Hide animation complete, reset progress and clear canvas
              hideStartProgressRef.current = 0;
            }
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
    }, [colors, size, spacing, speed, revealFrom, trigger, flicker, bulge]);

    // Manual trigger control via `active` prop
    useEffect(() => {
      if (trigger !== "manual") return;
      const now = Date.now();
      if (active) {
        // Mimic mouse enter
        if (hideStartProgressRef.current > 0) {
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = speed * 6;
          const hideProgress = Math.pow(hideElapsed, 2) * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          const effectiveElapsed = Math.pow(currentProgress / (speed * 3), 1 / 3);
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
      } else {
        // Mimic mouse leave
        if (isHoveredRef.current) {
          const currentProgress = maxRevealProgressRef.current;
          hideStartTimeRef.current = Date.now();
          hideStartProgressRef.current = currentProgress;
          isHoveredRef.current = false;
        }
      }
    }, [active, trigger, speed, bulge]);

    const handleMouseEnter = () => {
      if (trigger === "hover" && !isHoveredRef.current) {
        const now = Date.now();
        
        // If we're currently hiding, resume from where we left off
        if (hideStartProgressRef.current > 0) {
          // Calculate current position during hide
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = speed * 6;
          const hideProgress = Math.pow(hideElapsed, 2) * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          
          // Reverse the cubic easing formula: progress = elapsed^3 * speed * 3
          // So: elapsed = (progress / (speed * 3)) ^ (1/3)
          const effectiveElapsed = Math.pow(currentProgress / (speed * 3), 1 / 3);
          const simulatedStartTime = now - effectiveElapsed * 1000;
          revealStartTimeRef.current = simulatedStartTime;
        } else {
          // Fresh start
          revealStartTimeRef.current = now;
        }
        
        // Reset bulge animation on each hover when repeat is false
        if (bulge && !bulge.repeat) {
          bulgeStartTimeRef.current = now;
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

    const handleClick = () => {
      if (trigger !== "click") return;
      if (!isHoveredRef.current) {
        // Enter
        const now = Date.now();
        if (hideStartProgressRef.current > 0) {
          const hideElapsed = (now - hideStartTimeRef.current) / 1000;
          const hideSpeed = speed * 6;
          const hideProgress = Math.pow(hideElapsed, 2) * hideSpeed;
          const currentProgress = Math.max(0, hideStartProgressRef.current - hideProgress);
          const effectiveElapsed = Math.pow(currentProgress / (speed * 3), 1 / 3);
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
      } else {
        // Leave
        const currentProgress = maxRevealProgressRef.current;
        hideStartTimeRef.current = Date.now();
        hideStartProgressRef.current = currentProgress;
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
        onClick={handleClick}
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
export type { BulgeConfig };

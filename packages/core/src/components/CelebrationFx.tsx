"use client";

import React, { useEffect, useRef } from "react";
import { Flex } from ".";

type CelebrationType = "confetti" | "fireworks";

interface CelebrationFxProps extends React.ComponentProps<typeof Flex> {
  type?: CelebrationType;
  speed?: number;
  colors?: string[];
  intensity?: number;
  duration?: number;
  trigger?: "mount" | "hover" | "manual" | "click";
  active?: boolean; // For manual trigger
  children?: React.ReactNode;
}

interface ConfettiPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
  opacity: number;
  shape: "rectangle" | "circle" | "triangle";
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  velocityY: number;
  color: string;
  exploded: boolean;
  particles: FireworkParticle[];
}

interface FireworkParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: string;
  opacity: number;
  size: number;
  life: number;
  maxLife: number;
}

const CelebrationFx = React.forwardRef<HTMLDivElement, CelebrationFxProps>(
  (
    {
      type = "confetti",
      speed = 1,
      colors = ["brand-solid-medium", "accent-solid-medium"],
      intensity = 50,
      duration,
      trigger = "mount",
      active = true,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const particlesRef = useRef<(ConfettiPiece | Firework)[]>([]);
    const isEmittingRef = useRef<boolean>(trigger === "mount");
    const emitStartTimeRef = useRef<number>(Date.now());
    const isHoveredRef = useRef<boolean>(false);
    const fireworkTimerRef = useRef<number>(0);
    const clickPositionRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      if (forwardedRef) {
        if ("current" in forwardedRef) {
          forwardedRef.current = containerRef.current;
        } else if (typeof forwardedRef === "function") {
          forwardedRef(containerRef.current);
        }
      }
    }, [forwardedRef]);

    // Handle manual trigger
    useEffect(() => {
      if (trigger === "manual") {
        if (active) {
          isEmittingRef.current = true;
          emitStartTimeRef.current = Date.now();
        } else {
          isEmittingRef.current = false;
        }
      }
    }, [trigger, active]);

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
        const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
        return computedColor || color;
      });

      // Initialize confetti
      const initializeConfetti = () => {
        const particles: ConfettiPiece[] = [];
        const shapes: ("rectangle" | "circle" | "triangle")[] = ["rectangle", "circle", "triangle"];

        for (let i = 0; i < intensity; i++) {
          // Stagger particles more dramatically over a larger vertical range
          const stagger = (i / intensity) * canvasHeight * 2;
          particles.push({
            x: Math.random() * canvasWidth,
            y: -canvasHeight - Math.random() * canvasHeight - stagger,
            width: 8 + Math.random() * 8,
            height: 6 + Math.random() * 6,
            color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            velocityX: (Math.random() - 0.5) * 3,
            velocityY: (0.5 + Math.random() * 2.5) * speed,
            gravity: (0.12 + Math.random() * 0.06) * speed,
            opacity: 0.8 + Math.random() * 0.2,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
          });
        }

        return particles;
      };

      // Create a new firework (explodes immediately at random or click position)
      const createFirework = (clickPos?: { x: number; y: number }) => {
        const firework: Firework = {
          x: clickPos ? clickPos.x : Math.random() * canvasWidth,
          y: clickPos ? clickPos.y : canvasHeight * (0.2 + Math.random() * 0.4),
          targetY: 0, // Not used anymore
          velocityY: 0,
          color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
          exploded: true, // Start already exploded
          particles: [],
        };
        // Explode immediately
        explodeFirework(firework);
        return firework;
      };

      // Explode firework into particles
      const explodeFirework = (firework: Firework) => {
        const particleCount = 30 + Math.floor(Math.random() * 20);
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount;
          const velocity = 1 + Math.random() * 3;
          firework.particles.push({
            x: firework.x,
            y: firework.y,
            velocityX: Math.cos(angle) * velocity * speed,
            velocityY: Math.sin(angle) * velocity * speed,
            color: firework.color,
            opacity: 1,
            size: 1 + Math.random(),
            life: 0,
            maxLife: 60 + Math.random() * 40,
          });
        }
        firework.exploded = true;
      };

      // Initialize particles only if not already initialized
      if (particlesRef.current.length === 0 && type === "confetti") {
        particlesRef.current = initializeConfetti();
      }

      // Animation loop
      const animate = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Check if we should still be emitting new particles
        const shouldEmit =
          trigger === "hover" ? isHoveredRef.current : 
          trigger === "manual" ? active : 
          trigger === "click" ? clickPositionRef.current !== null :
          isEmittingRef.current;

        // Check duration limit
        if (duration && isEmittingRef.current && trigger !== "manual") {
          const elapsed = (Date.now() - emitStartTimeRef.current) / 1000;
          if (elapsed > duration) {
            isEmittingRef.current = false;
          }
        }

        if (type === "confetti") {
          // Update and draw confetti
          (particlesRef.current as ConfettiPiece[]).forEach((piece) => {
            // Update physics
            piece.velocityY += piece.gravity;
            piece.x += piece.velocityX;
            piece.y += piece.velocityY;
            piece.rotation += piece.rotationSpeed;

            // Add some air resistance
            piece.velocityX *= 0.99;

            // Only respawn if we're still emitting
            if (piece.y > canvasHeight + 50 && shouldEmit) {
              piece.y = -20 - Math.random() * canvasHeight * 0.5;
              piece.x = Math.random() * canvasWidth;
              piece.velocityX = (Math.random() - 0.5) * 3;
              piece.velocityY = (0.5 + Math.random() * 2.5) * speed;
              piece.gravity = (0.12 + Math.random() * 0.06) * speed;
            }

            // Only draw if still on screen
            if (piece.y < canvasHeight + 100) {
              // Draw confetti piece
              ctx.save();
              ctx.translate(piece.x, piece.y);
              ctx.rotate(piece.rotation);
              ctx.globalAlpha = piece.opacity;
              ctx.fillStyle = piece.color;

              if (piece.shape === "rectangle") {
                ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
              } else if (piece.shape === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, piece.width / 2, 0, Math.PI * 2);
                ctx.fill();
              } else if (piece.shape === "triangle") {
                ctx.beginPath();
                ctx.moveTo(0, -piece.height / 2);
                ctx.lineTo(piece.width / 2, piece.height / 2);
                ctx.lineTo(-piece.width / 2, piece.height / 2);
                ctx.closePath();
                ctx.fill();
              }

              ctx.restore();
            }
          });
        } else if (type === "fireworks") {
          // Launch new fireworks
          if (trigger === "click" && clickPositionRef.current) {
            // Fire from click position
            particlesRef.current.push(createFirework(clickPositionRef.current));
            clickPositionRef.current = null;
          } else {
            fireworkTimerRef.current++;
            if (shouldEmit && fireworkTimerRef.current > 20 / speed) {
              // Launch new firework every ~20 frames
              fireworkTimerRef.current = 0;
              particlesRef.current.push(createFirework());
            }
          }

          // Update and draw fireworks (explosion particles only)
          (particlesRef.current as Firework[]).forEach((firework) => {
            // Update and draw explosion particles
            firework.particles.forEach((particle) => {
              particle.life++;

              if (particle.life < particle.maxLife) {
                // Update position
                particle.x += particle.velocityX;
                particle.y += particle.velocityY;
                particle.velocityY += 0.1; // Gravity

                // Fade out
                particle.opacity = 1 - particle.life / particle.maxLife;

                // Draw particle
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
              }
            });
          });
          
          // Clean up dead fireworks (only when not emitting)
          if (!shouldEmit) {
            particlesRef.current = (particlesRef.current as Firework[]).filter((firework) => {
              // Keep if any particles are still alive
              return firework.particles.some(p => p.life < p.maxLife);
            });
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
    }, [type, colors, speed, intensity, duration, trigger]);

    const handleMouseEnter = () => {
      if (trigger === "hover" && !isHoveredRef.current) {
        isHoveredRef.current = true;
        isEmittingRef.current = true;
        emitStartTimeRef.current = Date.now();
      }
    };

    const handleMouseLeave = () => {
      if (trigger === "hover" && isHoveredRef.current) {
        isHoveredRef.current = false;
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (trigger === "click" && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (type === "confetti") {
          // For confetti, add burst of particles from click position
          const shapes: ("rectangle" | "circle" | "triangle")[] = ["rectangle", "circle", "triangle"];
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const parsedColors = colors.map((color) => {
            const computedColor = getComputedStyle(containerRef.current!).getPropertyValue(`--${color}`);
            return computedColor || color;
          });
          
          for (let i = 0; i < intensity; i++) {
            const angle = (Math.PI * 2 * i) / intensity;
            const velocity = 2 + Math.random() * 3;
            (particlesRef.current as ConfettiPiece[]).push({
              x,
              y,
              width: 8 + Math.random() * 8,
              height: 6 + Math.random() * 6,
              color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.2,
              velocityX: Math.cos(angle) * velocity,
              velocityY: Math.sin(angle) * velocity - 2, // Slight upward bias
              gravity: (0.12 + Math.random() * 0.06) * speed,
              opacity: 0.8 + Math.random() * 0.2,
              shape: shapes[Math.floor(Math.random() * shapes.length)],
            });
          }
        } else {
          // For fireworks, store click position
          clickPositionRef.current = { x, y };
        }
      }
    };

    return (
      <Flex
        ref={containerRef}
        fill
        overflow="hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          cursor: trigger === "click" ? "pointer" : undefined,
          ...rest.style,
        }}
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
            pointerEvents: "none",
          }}
        />
        {children}
      </Flex>
    );
  },
);

CelebrationFx.displayName = "CelebrationFx";
export { CelebrationFx };

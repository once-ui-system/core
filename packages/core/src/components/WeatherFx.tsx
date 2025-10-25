"use client";

import React, { useEffect, useRef } from "react";
import { Flex } from ".";

type WeatherType = "rain" | "snow" | "leaves";

interface WeatherFxProps extends React.ComponentProps<typeof Flex> {
  type?: WeatherType;
  speed?: number;
  colors?: string[];
  intensity?: number;
  angle?: number;
  duration?: number;
  trigger?: "mount" | "hover";
  children?: React.ReactNode;
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
  depth: number; // 0-1, affects size, speed, opacity
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

const WeatherFx = React.forwardRef<HTMLDivElement, WeatherFxProps>(
  (
    {
      type = "rain",
      speed = 1,
      colors = ["brand-solid-medium"],
      intensity = 50,
      angle = 0,
      duration,
      trigger = "mount",
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const particlesRef = useRef<(RainDrop | Snowflake | Leaf)[]>([]);
    const timeRef = useRef<number>(0);
    const isEmittingRef = useRef<boolean>(trigger === "mount");
    const emitStartTimeRef = useRef<number>(Date.now());
    const isHoveredRef = useRef<boolean>(false);

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
        const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
        return computedColor || color;
      });

      // Initialize particles based on type
      const initializeRain = () => {
        const particles: RainDrop[] = [];
        
        // Calculate spawn area based on angle
        const angleRad = (angle * Math.PI) / 180;
        const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
        
        // Create initial rain drops
        for (let i = 0; i < intensity; i++) {
          // Expand spawn width to account for angle
          const spawnWidth = canvasWidth + horizontalOffset * 2;
          const spawnX = Math.random() * spawnWidth - horizontalOffset;
          
          particles.push({
            x: spawnX,
            y: Math.random() * canvasHeight - canvasHeight, // Start above canvas
            length: 10 + Math.random() * 20, // Varying lengths
            speed: (2 + Math.random() * 3) * speed, // Varying speeds
            color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
            opacity: 0.3 + Math.random() * 0.5,
            thickness: 1 + Math.random() * 1.5,
          });
        }
        
        return particles;
      };

      // Initialize snow particles
      const initializeSnow = () => {
        const particles: Snowflake[] = [];
        
        // Calculate spawn area based on angle
        const angleRad = (angle * Math.PI) / 180;
        const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
        
        for (let i = 0; i < intensity; i++) {
          const depth = Math.random(); // 0 = far, 1 = near
          const size = 2 + depth * 4; // 2-6px, bigger = closer
          
          // Expand spawn width to account for angle
          const spawnWidth = canvasWidth + horizontalOffset * 2;
          const spawnX = Math.random() * spawnWidth - horizontalOffset;
          
          particles.push({
            x: spawnX,
            y: Math.random() * canvasHeight - canvasHeight,
            size,
            speed: (0.3 + depth * 0.7) * speed, // 0.3-1.0x speed, closer = faster
            color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
            opacity: 0.4 + depth * 0.5, // 0.4-0.9, closer = more opaque
            swayAmplitude: 20 + Math.random() * 30, // 20-50px horizontal sway
            swaySpeed: 0.5 + Math.random() * 1, // Varying sway speeds
            swayOffset: Math.random() * Math.PI * 2, // Random starting phase
            depth,
          });
        }
        
        return particles;
      };

      // Initialize leaves particles
      const initializeLeaves = () => {
        const particles: Leaf[] = [];
        
        // Calculate spawn area based on angle
        const angleRad = (angle * Math.PI) / 180;
        const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
        
        for (let i = 0; i < intensity; i++) {
          const depth = Math.random(); // 0 = far, 1 = near
          const width = 8 + depth * 12; // 8-20px, bigger = closer
          const height = width * (0.6 + Math.random() * 0.4); // Leaf aspect ratio
          
          // Expand spawn width to account for angle
          const spawnWidth = canvasWidth + horizontalOffset * 2;
          const spawnX = Math.random() * spawnWidth - horizontalOffset;
          
          // Pick two colors for gradient (either from same color or adjacent colors)
          const colorIndex = Math.floor(Math.random() * parsedColors.length);
          const color1 = parsedColors[colorIndex];
          const color2 = parsedColors[Math.min(colorIndex + 1, parsedColors.length - 1)];
          
          particles.push({
            x: spawnX,
            y: Math.random() * canvasHeight - canvasHeight,
            width,
            height,
            speed: (0.4 + depth * 0.8) * speed, // 0.4-1.2x speed
            color1,
            color2,
            opacity: 0.6 + depth * 0.3, // 0.6-0.9
            swayAmplitude: 30 + Math.random() * 50, // 30-80px stronger sway
            swaySpeed: 0.3 + Math.random() * 0.7, // Slower sway for leaves
            swayOffset: Math.random() * Math.PI * 2,
            rotation: Math.random() * Math.PI * 2, // Random starting rotation
            rotationSpeed: (Math.random() - 0.5) * 0.08, // -0.04 to 0.04 rad/frame
            rotation3D: Math.random() * Math.PI * 2, // Random 3D flip angle
            rotation3DSpeed: (Math.random() - 0.5) * 0.06, // 3D tumbling speed
            depth,
          });
        }
        
        return particles;
      };

      // Initialize particles
      particlesRef.current = type === "rain" ? initializeRain() : type === "snow" ? initializeSnow() : type === "leaves" ? initializeLeaves() : [];

      // Animation loop
      const angleRad = (angle * Math.PI) / 180; // Convert angle to radians
      const dx = Math.sin(angleRad); // Horizontal component
      const dy = Math.cos(angleRad); // Vertical component
      const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
      
      const animate = () => {
        timeRef.current += 0.016; // Approximate frame time
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Check if we should still be emitting new particles
        const shouldEmit = trigger === "hover" ? isHoveredRef.current : isEmittingRef.current;
        
        // Check duration limit
        if (duration && isEmittingRef.current) {
          const elapsed = (Date.now() - emitStartTimeRef.current) / 1000;
          if (elapsed > duration) {
            isEmittingRef.current = false;
          }
        }

        if (type === "rain") {
          // Update and draw rain drops
          (particlesRef.current as RainDrop[]).forEach((drop) => {
            // Update position with angle
            drop.y += drop.speed * dy;
            drop.x += drop.speed * dx;

            // Reset if it goes below canvas or off the sides (with expanded bounds)
            const leftBound = -horizontalOffset - 50;
            const rightBound = canvasWidth + horizontalOffset + 50;
            
            if (drop.y > canvasHeight || drop.x < leftBound || drop.x > rightBound) {
              if (shouldEmit) {
                // Respawn at top
                drop.y = -drop.length;
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                drop.x = Math.random() * spawnWidth - horizontalOffset;
              } else {
                // Mark for removal by moving far off screen
                drop.y = canvasHeight + 1000;
              }
            }

            // Draw rain drop as an angled line with gradient
            const x1 = drop.x;
            const y1 = drop.y;
            const x2 = drop.x + dx * drop.length;
            const y2 = drop.y + dy * drop.length;
            
            // Create gradient from solid to transparent
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, 'transparent');
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
          // Update and draw snowflakes
          (particlesRef.current as Snowflake[]).forEach((flake) => {
            // Calculate sway motion (sine wave)
            const swayX = Math.sin(timeRef.current * flake.swaySpeed + flake.swayOffset) * flake.swayAmplitude;
            
            // Update position with angle and sway
            flake.y += flake.speed * dy;
            flake.x += flake.speed * dx;

            // Reset if it goes below canvas or off the sides
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

            // Draw snowflake (no blur filter for performance)
            ctx.globalAlpha = flake.opacity;
            ctx.fillStyle = flake.color;
            
            // Draw as circle with sway applied
            ctx.beginPath();
            ctx.arc(flake.x + swayX, flake.y, flake.size / 2, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (type === "leaves") {
          // Update and draw leaves
          (particlesRef.current as Leaf[]).forEach((leaf) => {
            // Calculate sway motion
            const swayX = Math.sin(timeRef.current * leaf.swaySpeed + leaf.swayOffset) * leaf.swayAmplitude;
            
            // Update rotation (2D spin)
            leaf.rotation += leaf.rotationSpeed;
            // Update 3D rotation (flip/tumble)
            leaf.rotation3D += leaf.rotation3DSpeed;
            
            // Update position with angle and sway
            leaf.y += leaf.speed * dy;
            leaf.x += leaf.speed * dx;

            // Reset if it goes below canvas or off the sides
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

            // Calculate 3D scale effect (flipping around vertical axis)
            const scaleXRaw = Math.cos(leaf.rotation3D);
            // Clamp scale to minimum 0.15 so leaves stay visible when edge-on
            const scaleX = scaleXRaw > 0 
              ? Math.max(0.15, scaleXRaw) 
              : Math.min(-0.15, scaleXRaw);
            
            // Draw leaf with rotation and gradient
            ctx.save();
            ctx.translate(leaf.x + swayX, leaf.y);
            ctx.rotate(leaf.rotation);
            ctx.scale(scaleX, 1); // Apply 3D flip effect with minimum width
            // Fade when edge-on but maintain minimum 50% opacity
            const opacityMultiplier = Math.max(0.5, Math.abs(scaleXRaw * 0.3 + 0.7));
            ctx.globalAlpha = leaf.opacity * opacityMultiplier;
            
            // Create gradient from color1 to color2
            const gradient = ctx.createLinearGradient(-leaf.width / 2, 0, leaf.width / 2, 0);
            gradient.addColorStop(0, leaf.color1);
            gradient.addColorStop(0.5, leaf.color2);
            gradient.addColorStop(1, leaf.color1);
            
            // Draw leaf shape (pointed oval using bezier curves)
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            const w = leaf.width / 2;
            const h = leaf.height / 2;
            
            // Start at top tip
            ctx.moveTo(0, -h);
            // Curve to right side (widest point)
            ctx.bezierCurveTo(w * 0.7, -h * 0.5, w * 0.7, h * 0.5, 0, h);
            // Curve to left side and back to top
            ctx.bezierCurveTo(-w * 0.7, h * 0.5, -w * 0.7, -h * 0.5, 0, -h);
            
            ctx.fill();
            
            ctx.restore();
          });
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
    }, [type, colors, speed, intensity, angle, duration, trigger]);

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

    return (
      <Flex
        ref={containerRef}
        fill
        overflow="hidden"
        onMouseEnter={handleMouseEnter}
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
            pointerEvents: "none",
          }}
        />
        {children}
      </Flex>
    );
  },
);

WeatherFx.displayName = "WeatherFx";
export { WeatherFx };

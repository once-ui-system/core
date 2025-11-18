"use client";

import React, { useEffect, useRef } from "react";
import { Flex } from ".";

type WeatherType = "rain" | "snow" | "leaves" | "lightning";

interface WeatherFxProps extends React.ComponentProps<typeof Flex> {
  type?: WeatherType;
  speed?: number;
  colors?: string[];
  intensity?: number;
  angle?: number;
  duration?: number;
  trigger?: "mount" | "hover" | "click" | "manual";
  active?: boolean;
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

interface LightningBranch {
  startIndex: number;
  segments: { x: number; y: number }[];
  thickness: number;
  children: LightningBranch[]; // Hierarchical sub-branches
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
  revealDuration: number; // Duration for the reveal animation
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
      active = false,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
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

      // Recursive function to generate chaotic, organic branches
      const generateBranch = (
        startX: number,
        startY: number,
        baseSegmentLength: number,
        branchLevel: number,
        maxLevel: number,
        angle: number,
        parentThickness: number
      ): { segments: { x: number; y: number }[]; children: LightningBranch[] } => {
        const segments: { x: number; y: number }[] = [];
        const children: LightningBranch[] = [];
        
        // Longer branches that decrease more gradually with depth
        const lengthMultiplier = Math.pow(0.7, branchLevel);
        const branchLength = 3 + Math.floor(Math.random() * 4); // 3-6 segments
        
        let currentX = startX;
        let currentY = startY;
        let currentAngle = angle;
        
        for (let i = 0; i < branchLength; i++) {
          // Larger segments for longer branches
          const segmentLength = baseSegmentLength * lengthMultiplier * (0.6 + Math.random() * 0.6);
          
          // Add angular variation for organic chaos
          currentAngle += (Math.random() - 0.5) * 0.8;
          
          // Move in the current angle direction
          currentX += Math.cos(currentAngle) * segmentLength;
          currentY += Math.sin(currentAngle) * segmentLength;
          
          segments.push({ x: currentX, y: currentY });
          
          // Moderate probability of branching
          if (branchLevel < maxLevel && i > 0) {
            // Only primary branches get multiple attempts
            const branchAttempts = branchLevel === 1 ? 1 : 1;
            
            for (let attempt = 0; attempt < branchAttempts; attempt++) {
              // Lower probability: 35% at level 1, 25% at level 2, etc.
              const branchProbability = 0.35 - branchLevel * 0.1;
              
              if (Math.random() < branchProbability) {
                // Random angle deviation from current direction (-90 to +90 degrees)
                const angleDeviation = (Math.random() - 0.5) * Math.PI;
                const childAngle = currentAngle + angleDeviation;
                
                const childBranch = generateBranch(
                  currentX,
                  currentY,
                  baseSegmentLength,
                  branchLevel + 1,
                  maxLevel,
                  childAngle,
                  parentThickness
                );
                
                if (childBranch.segments.length > 0) {
                  children.push({
                    startIndex: i,
                    segments: childBranch.segments,
                    thickness: parentThickness * Math.pow(0.6, branchLevel + 1),
                    children: childBranch.children,
                  });
                }
              }
            }
          }
        }
        
        return { segments, children };
      };

      // Generate lightning bolt with chaotic branches
      const generateLightningBolt = (startX: number, startY: number, endY: number): Lightning => {
        const segments: { x: number; y: number }[] = [];
        const branches: LightningBranch[] = [];
        
        let currentX = startX;
        let currentY = startY;
        const baseSegmentLength = 12 + Math.random() * 15; // Smaller segments for detail
        const mainThickness = 2.5 + Math.random() * 1.5;
        
        segments.push({ x: currentX, y: currentY });
        
        // Main bolt with more erratic path
        let currentAngle = Math.PI / 2; // Start going down (90 degrees)
        
        while (currentY < endY) {
          // Vary segment length significantly
          const segmentLength = baseSegmentLength * (0.5 + Math.random() * 0.8);
          
          // Add significant angular variation for jagged appearance
          currentAngle += (Math.random() - 0.5) * 0.6;
          
          // Ensure we're generally moving downward
          if (currentAngle < Math.PI / 4) currentAngle = Math.PI / 4; // Min 45 degrees
          if (currentAngle > (3 * Math.PI) / 4) currentAngle = (3 * Math.PI) / 4; // Max 135 degrees
          
          currentX += Math.cos(currentAngle) * segmentLength;
          currentY += Math.sin(currentAngle) * segmentLength;
          
          segments.push({ x: currentX, y: currentY });
          
          // Moderate chance of branching (35%) for balanced appearance
          if (Math.random() < 0.35 && segments.length > 2) {
            // Random angle deviation (-120 to +120 degrees from current)
            const angleDeviation = (Math.random() - 0.5) * (2 * Math.PI / 3);
            const branchAngle = currentAngle + angleDeviation;
            
            const primaryBranch = generateBranch(
              currentX,
              currentY,
              baseSegmentLength,
              1,
              3, // Max 3 levels to reduce chaos
              branchAngle,
              mainThickness
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

      // Initialize lightning (empty array, lightning spawns dynamically)
      const initializeLightning = () => {
        return [] as Lightning[];
      };

      // Initialize particles only for mount trigger (manual/click handled by their respective handlers)
      // Only initialize if particles don't already exist to preserve active particles across re-renders
      if (particlesRef.current.length === 0) {
        const shouldInitialize = trigger === "mount";
        particlesRef.current = shouldInitialize
          ? (type === "rain" ? initializeRain() : 
             type === "snow" ? initializeSnow() : 
             type === "leaves" ? initializeLeaves() : 
             type === "lightning" ? initializeLightning() : 
             [])
          : [];
      }

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
        } else if (type === "lightning") {
          // Lightning spawning logic
          const currentTime = Date.now();
          const timeSinceLastLightning = (currentTime - lastLightningTimeRef.current) / 1000;
          
          // Reduced frequency: intensity 1 = ~15s, intensity 10 = ~3s, intensity 50 = ~0.6s, intensity 100 = ~0.3s
          const spawnInterval = Math.max(0.3, 15 / intensity);
          
          if (shouldEmit && timeSinceLastLightning > spawnInterval) {
            // Calculate number of simultaneous bolts based on intensity
            // After a multi-bolt strike, force a single bolt for variation
            let boltCount = 1;
            
            if (lastBoltCountRef.current > 1) {
              // Previous strike was multi-bolt, do single bolt this time
              boltCount = 1;
            } else {
              // Previous was single, can do multi-bolt based on intensity
              if (intensity > 60) {
                // 60% chance of multi-bolt at high intensity
                boltCount = Math.random() < 0.6 ? (2 + Math.floor(Math.random() * 3)) : 1; // 2-4 bolts or 1
              } else if (intensity > 30) {
                // 50% chance of multi-bolt at medium intensity
                boltCount = Math.random() < 0.5 ? (2 + Math.floor(Math.random() * 2)) : 1; // 2-3 bolts or 1
              } else if (intensity > 15) {
                // 30% chance of double bolt at low-medium intensity
                boltCount = Math.random() < 0.3 ? 2 : 1;
              }
              // intensity <= 15: always single bolt
            }
            
            // Store bolt count for next iteration
            lastBoltCountRef.current = boltCount;
            
            // Spawn multiple bolts with slight time offset for realism
            for (let i = 0; i < boltCount; i++) {
              const startX = Math.random() * canvasWidth;
              const bolt = generateLightningBolt(startX, 0, canvasHeight);
              // Add slight age offset for staggered appearance
              bolt.age = -i * 0.025; // 25ms offset between bolts
              (particlesRef.current as Lightning[]).push(bolt);
            }
            
            lastLightningTimeRef.current = currentTime;
          }
          
          // Update and draw lightning bolts
          (particlesRef.current as Lightning[]).forEach((bolt, index) => {
            bolt.age += 0.016; // Increment age
            
            // Skip if not yet started (negative age for staggered bolts)
            if (bolt.age < 0) return;
            
            // Remove expired bolts
            if (bolt.age > bolt.lifetime) {
              (particlesRef.current as Lightning[]).splice(index, 1);
              return;
            }
            
            // Calculate reveal progress (how much of the bolt to draw)
            const revealProgress = Math.min(1, bolt.age / bolt.revealDuration);
            
            // Calculate opacity fade (flash effect)
            const lifeProgress = bolt.age / bolt.lifetime;
            let currentOpacity = bolt.opacity;
            
            // During reveal: full brightness
            // After reveal: hold briefly, then fade out
            if (lifeProgress < bolt.revealDuration / bolt.lifetime) {
              currentOpacity *= revealProgress; // Fade in during reveal
            } else if (lifeProgress < 0.3) {
              currentOpacity *= 1; // Hold at full brightness
            } else {
              // Fade out in the remaining time
              const fadeProgress = (lifeProgress - 0.3) / 0.7;
              currentOpacity *= (1 - fadeProgress);
            }
            
            // Calculate how many segments to draw based on reveal progress
            const totalSegments = bolt.segments.length;
            const segmentsToDraw = Math.ceil(totalSegments * revealProgress);
            
            // Draw main bolt with reveal effect
            ctx.globalAlpha = currentOpacity;
            ctx.strokeStyle = bolt.color;
            ctx.lineWidth = bolt.thickness;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            // Draw glow effect
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
            
            // Recursive function to draw hierarchical branches
            const drawBranch = (
              branch: LightningBranch,
              parentSegments: { x: number; y: number }[],
              parentSegmentsToDraw: number
            ) => {
              // Only draw if parent bolt has reached this branch point
              if (branch.startIndex < parentSegmentsToDraw) {
                const startSegment = parentSegments[branch.startIndex];
                
                // Calculate how much of this branch to reveal
                const segmentsPastBranch = parentSegmentsToDraw - branch.startIndex;
                const branchRevealProgress = Math.min(1, segmentsPastBranch / 3);
                const branchSegmentsToDraw = Math.ceil(branch.segments.length * branchRevealProgress);
                
                // Draw this branch
                ctx.beginPath();
                ctx.moveTo(startSegment.x, startSegment.y);
                for (let i = 0; i < branchSegmentsToDraw; i++) {
                  const segment = branch.segments[i];
                  ctx.lineTo(segment.x, segment.y);
                }
                ctx.lineWidth = branch.thickness;
                ctx.stroke();
                
                // Recursively draw child branches
                if (branch.children && branch.children.length > 0) {
                  branch.children.forEach((childBranch) => {
                    drawBranch(childBranch, branch.segments, branchSegmentsToDraw);
                  });
                }
              }
            };
            
            // Draw all primary branches and their hierarchies
            bolt.branches.forEach((branch) => {
              drawBranch(branch, bolt.segments, segmentsToDraw);
            });
            
            // Reset shadow
            ctx.shadowBlur = 0;
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

    // Respond to external control in manual mode
    useEffect(() => {
      if (trigger !== "manual") return;
      if (active && !isEmittingRef.current) {
        // Initialize particles if starting emission
        if (particlesRef.current.length === 0) {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (canvas && container) {
            const canvasWidth = canvas.width / 2;
            const canvasHeight = canvas.height / 2;
            const parsedColors = colors.map((color) => {
              const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
              return computedColor || color;
            });
            
            if (type === "rain") {
              const particles: RainDrop[] = [];
              const angleRad = (angle * Math.PI) / 180;
              const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
              for (let i = 0; i < intensity; i++) {
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                const spawnX = Math.random() * spawnWidth - horizontalOffset;
                particles.push({
                  x: spawnX,
                  y: Math.random() * canvasHeight - canvasHeight,
                  length: 10 + Math.random() * 20,
                  speed: (2 + Math.random() * 3) * speed,
                  color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
                  opacity: 0.3 + Math.random() * 0.5,
                  thickness: 1 + Math.random() * 1.5,
                });
              }
              particlesRef.current = particles;
            } else if (type === "snow") {
              const particles: Snowflake[] = [];
              const angleRad = (angle * Math.PI) / 180;
              const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
              for (let i = 0; i < intensity; i++) {
                const depth = Math.random();
                const size = 2 + depth * 4;
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                const spawnX = Math.random() * spawnWidth - horizontalOffset;
                particles.push({
                  x: spawnX,
                  y: Math.random() * canvasHeight - canvasHeight,
                  size,
                  speed: (0.3 + depth * 0.7) * speed,
                  color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
                  opacity: 0.4 + depth * 0.5,
                  swayAmplitude: 20 + Math.random() * 30,
                  swaySpeed: 0.5 + Math.random() * 1,
                  swayOffset: Math.random() * Math.PI * 2,
                  depth,
                });
              }
              particlesRef.current = particles;
            } else if (type === "leaves") {
              const particles: Leaf[] = [];
              const angleRad = (angle * Math.PI) / 180;
              const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
              for (let i = 0; i < intensity; i++) {
                const depth = Math.random();
                const width = 8 + depth * 12;
                const height = width * (0.6 + Math.random() * 0.4);
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                const spawnX = Math.random() * spawnWidth - horizontalOffset;
                const colorIndex = Math.floor(Math.random() * parsedColors.length);
                const color1 = parsedColors[colorIndex];
                const color2 = parsedColors[Math.min(colorIndex + 1, parsedColors.length - 1)];
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
              particlesRef.current = particles;
            }
          }
        }
        isEmittingRef.current = true;
        emitStartTimeRef.current = Date.now();
      } else if (!active && isEmittingRef.current) {
        isEmittingRef.current = false;
      }
    }, [active, trigger]);

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

    const handleClick = () => {
      if (trigger !== "click") return;
      if (!isEmittingRef.current) {
        // Initialize particles if starting emission
        if (particlesRef.current.length === 0) {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (canvas && container) {
            const canvasWidth = canvas.width / 2;
            const canvasHeight = canvas.height / 2;
            const parsedColors = colors.map((color) => {
              const computedColor = getComputedStyle(container).getPropertyValue(`--${color}`);
              return computedColor || color;
            });
            
            if (type === "rain") {
              const particles: RainDrop[] = [];
              const angleRad = (angle * Math.PI) / 180;
              const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
              for (let i = 0; i < intensity; i++) {
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                const spawnX = Math.random() * spawnWidth - horizontalOffset;
                particles.push({
                  x: spawnX,
                  y: Math.random() * canvasHeight - canvasHeight,
                  length: 10 + Math.random() * 20,
                  speed: (2 + Math.random() * 3) * speed,
                  color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
                  opacity: 0.3 + Math.random() * 0.5,
                  thickness: 1 + Math.random() * 1.5,
                });
              }
              particlesRef.current = particles;
            } else if (type === "snow") {
              const particles: Snowflake[] = [];
              const angleRad = (angle * Math.PI) / 180;
              const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
              for (let i = 0; i < intensity; i++) {
                const depth = Math.random();
                const size = 2 + depth * 4;
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                const spawnX = Math.random() * spawnWidth - horizontalOffset;
                particles.push({
                  x: spawnX,
                  y: Math.random() * canvasHeight - canvasHeight,
                  size,
                  speed: (0.3 + depth * 0.7) * speed,
                  color: parsedColors[Math.floor(Math.random() * parsedColors.length)],
                  opacity: 0.4 + depth * 0.5,
                  swayAmplitude: 20 + Math.random() * 30,
                  swaySpeed: 0.5 + Math.random() * 1,
                  swayOffset: Math.random() * Math.PI * 2,
                  depth,
                });
              }
              particlesRef.current = particles;
            } else if (type === "leaves") {
              const particles: Leaf[] = [];
              const angleRad = (angle * Math.PI) / 180;
              const horizontalOffset = Math.abs(Math.tan(angleRad) * canvasHeight);
              for (let i = 0; i < intensity; i++) {
                const depth = Math.random();
                const width = 8 + depth * 12;
                const height = width * (0.6 + Math.random() * 0.4);
                const spawnWidth = canvasWidth + horizontalOffset * 2;
                const spawnX = Math.random() * spawnWidth - horizontalOffset;
                const colorIndex = Math.floor(Math.random() * parsedColors.length);
                const color1 = parsedColors[colorIndex];
                const color2 = parsedColors[Math.min(colorIndex + 1, parsedColors.length - 1)];
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
              particlesRef.current = particles;
            }
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
        overflow="hidden"
        onMouseEnter={handleMouseEnter}
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

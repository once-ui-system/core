"use client";

import React, { forwardRef } from "react";
import { Row, Background } from ".";

export interface BlobFxProps extends React.ComponentProps<typeof Row> {
  seed?: number;
}

const BlobFx = forwardRef<HTMLDivElement, BlobFxProps>(({ seed = 0, ...flex }, ref) => {
  // Generate pseudo-random values based on seed for consistent variation
  const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
  const random2 = ((seed * 4877 + 37991) % 233280) / 233280;
  const random3 = ((seed * 7919 + 28411) % 233280) / 233280;
  
  // Randomize animation durations (±20%)
  const duration1 = 8 + (random1 - 0.5) * 3.2; // 6.4 - 9.6s
  const duration2 = 12 + (random2 - 0.5) * 4.8; // 9.6 - 14.4s
  const duration3 = 10 + (random3 - 0.5) * 4; // 8 - 12s
  
  // Randomize movement offsets (±30%)
  const offset1 = 1 + (random1 - 0.5) * 0.6; // 0.7 - 1.3
  const offset2 = 1 + (random2 - 0.5) * 0.6;
  const offset3 = 1 + (random3 - 0.5) * 0.6;
  
  return (
    <Row
      fill
      pointerEvents="none"
      overflow="hidden"
      style={{ filter: "blur(2rem)" }}
      {...flex}
    >

      {/* Blob 2 - Accent Strong */}
      <Background
        position="absolute"
        fill
        bottom="0"
        left="0"
        gradient={{
          display: true,
          colorStart: "accent-solid-weak",
          width: 38,
          height: 35,
        }}
        style={{
          animation: `blob2-${seed} ${duration2}s ease-in-out infinite`,
        }}
      />

      {/* Blob 3 - Brand Weak */}
      <Background
        position="absolute"
        fill
        bottom="0"
        left="-20%"
        gradient={{
          display: true,
          colorStart: "accent-solid-medium",
          width: 42,
          height: 25,
        }}
        style={{
          animation: `blob3-${seed} ${duration3}s ease-in-out infinite`,
          mixBlendMode: "plus-lighter",
        }}
      />
      
      {/* Blob 1 - Brand Strong */}
      <Background
        position="absolute"
        fill
        bottom="0"
        left="10%"
        gradient={{
          display: true,
          colorStart: "brand-solid-strong",
          width: 50,
          height: 35,
        }}
        style={{
          animation: `blob1-${seed} ${duration1}s ease-in-out infinite`,
          mixBlendMode: "screen",
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob1-${seed} {
            0%, 100% {
              transform: translateX(0);
            }
            33% {
              transform: translateX(${4 * offset1}rem);
            }
            66% {
              transform: translateX(${-3 * offset1}rem);
            }
          }

          @keyframes blob2-${seed} {
            0%, 100% {
              transform: translateX(0);
            }
            33% {
              transform: translateX(${-7 * offset2}rem);
            }
            66% {
              transform: translateX(${5 * offset2}rem);
            }
          }

          @keyframes blob3-${seed} {
            0%, 100% {
              transform: translateX(0);
            }
            33% {
              transform: translateX(${6 * offset3}rem);
            }
            66% {
              transform: translateX(${-6 * offset3}rem);
            }
          }
        `
      }} />
    </Row>
  );
})

BlobFx.displayName = "BlobFx";
export { BlobFx };
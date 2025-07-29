"use client";

import React, { useEffect, useState, useRef } from "react";
import { Row, Text } from ".";

export interface CountFxProps extends React.ComponentProps<typeof Text> {
  value: number;
  speed?: "slow" | "medium" | "fast" | number;
  duration?: number;
  easing?: "linear" | "ease-out" | "ease-in-out";
  format?: (value: number) => string;
  separator?: string;
  effect?: "smooth" | "wheel";
  children?: React.ReactNode;
}

const CountFx: React.FC<CountFxProps> = ({
  value,
  speed = "medium",
  duration = 1000,
  easing = "ease-out",
  format,
  separator,
  effect = "smooth",
  children,
  ...text
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | undefined>(undefined);
  const previousValueRef = useRef<number>(value);

  // Default format function with separator support
  const defaultFormat = (val: number) => {
    if (separator) {
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return val.toString();
  };

  const formatValue = format || defaultFormat;

  // Easing functions
  const getEasing = (progress: number): number => {
    switch (easing) {
      case "linear":
        return progress;
      case "ease-out":
        return 1 - Math.pow(1 - progress, 3);
      case "ease-in-out":
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default:
        return 1 - Math.pow(1 - progress, 3);
    }
  };

  // Wheel animation: create digit wheels
  const renderWheelDigits = (currentValue: number, targetValue: number) => {
    const currentStr = currentValue.toString().padStart(targetValue.toString().length, '0');
    const targetStr = targetValue.toString();
    const maxLength = Math.max(currentStr.length, targetStr.length);
    
    return Array.from({ length: maxLength }, (_, index) => {
      const currentDigit = parseInt(currentStr[maxLength - 1 - index] || '0');
      const targetDigit = parseInt(targetStr[maxLength - 1 - index] || '0');
      
      // Calculate progress for this specific digit
      const digitDifference = targetDigit - currentDigit;
      const digitProgress = Math.abs(digitDifference) > 0 ? 
        Math.min(Math.abs(digitDifference) / 10, 1) : 1; // Progress based on how close to target
      
      // Create wheel effect for this digit
      const wheelDigits = [];
      for (let i = 0; i <= 9; i++) {
        const isActive = i === currentDigit;
        
        // Calculate transition duration based on progress (slower as it approaches target)
        const transitionDuration = 0.1 + (digitProgress * 0.2); // 0.1s to 0.3s
        
        // Calculate position for wheel effect
        let position = 0;
        if (isActive) {
          position = 0; // Current digit is centered
        } else if (i < currentDigit) {
          position = -100; // Digits below current are above
        } else {
          position = 100; // Digits above current are below
        }
        
        wheelDigits.push(
          <Row
            center
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            key={i}
            style={{
              height: '1em',
              width: '100%',
              transform: `translateY(${position * 2}%)`,
              transition: `all ${transitionDuration}s ease-out`,
              pointerEvents: 'none',
            }}
          >
            {i}
          </Row>
        );
      }
      
      return (
        <Row
          align="center"
          overflow="hidden"
          inline
          key={index}
          style={{
            height: '1em',
            width: '0.8em',
            marginLeft: '-0.125em',
            marginRight: '-0.125em',
            position: 'relative',
            isolation: 'isolate',
          }}
        >
          {wheelDigits}
        </Row>
      );
    }).reverse();
  };

  useEffect(() => {
    if (value === previousValueRef.current) return;

    const startValue = previousValueRef.current;
    const endValue = value;
    const difference = endValue - startValue;
    
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = getEasing(progress);
      
      if (effect === "wheel") {
        // For wheel animation, we animate each digit independently
        const currentValue = Math.floor(startValue + (difference * easedProgress));
        setDisplayValue(currentValue);
      } else {
        // Smooth animation
        const currentValue = startValue + (difference * easedProgress);
        const currentStepValue = Math.floor(currentValue);
        setDisplayValue(currentStepValue);
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, speed, duration, easing, effect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (effect === "wheel") {
    return (
      <Text {...text} style={{ display: 'flex', alignItems: 'center', gap: '0.1em', ...text.style }}>
        {renderWheelDigits(displayValue, value)}
        {children}
      </Text>
    );
  }

  return (
    <Text {...text}>
      {formatValue(displayValue)}
      {children}
    </Text>
  );
};

CountFx.displayName = "CountFx";
export { CountFx }; 
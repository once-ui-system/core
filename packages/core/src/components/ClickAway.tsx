"use client";

import React, { useRef, useEffect, ReactNode } from 'react';

export interface ClickAwayProps {
  children: ReactNode;
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  active?: boolean;
  stopPropagation?: boolean;
  preventDefault?: boolean;
  ignoreElements?: HTMLElement[];
}

const ClickAway: React.FC<ClickAwayProps> = ({
  children,
  onClickAway,
  active = true,
  stopPropagation = false,
  preventDefault = false,
  ignoreElements = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) return;
    
    const handleClickAway = (event: MouseEvent | TouchEvent) => {
      // Skip if the click was on the container or its children
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Skip if the click was on any of the ignored elements
      for (const element of ignoreElements) {
        if (element && element.contains(event.target as Node)) {
          return;
        }
      }
      
      // Additional check for elements with display: 'contents' - check if the click target
      // is a descendant of any of the container's children
      if (containerRef.current) {
        const containerChildren = Array.from(containerRef.current.children);
        for (const child of containerChildren) {
          if (child.contains(event.target as Node)) {
            return;
          }
        }
      }
      
      // Stop propagation if requested
      if (stopPropagation) {
        event.stopPropagation();
      }
      
      // Prevent default if requested
      if (preventDefault) {
        event.preventDefault();
      }
      
      // Call the callback
      onClickAway(event);
    };
    
    // Add event listeners
    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('touchstart', handleClickAway);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('touchstart', handleClickAway);
    };
  }, [active, onClickAway, stopPropagation, preventDefault, ignoreElements]);
  
  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
      {children}
    </div>
  );
};

ClickAway.displayName = "ClickAway";
export { ClickAway };
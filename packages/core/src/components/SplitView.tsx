'use client';

import { Row, Card, Column } from '.';
import { useState, useEffect, useRef, ReactNode } from 'react';

interface SplitViewProps extends React.ComponentProps<typeof Row> {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultSplit?: number;
  minSplit?: number;
  maxSplit?: number;
}

function useResizeHandle(
  containerRef: React.RefObject<HTMLDivElement | null>,
  direction: 'row' | 'column'
) {
  const [splitRatio, setSplitRatio] = useState(0.3);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      let newRatio: number;
      if (direction === 'row') {
        // Horizontal split: calculate from left
        newRatio = (e.clientX - rect.left) / rect.width;
      } else {
        // Vertical split: calculate from top
        newRatio = (e.clientY - rect.top) / rect.height;
      }
      
      setSplitRatio(Math.max(0.2, Math.min(0.8, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'row' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, direction]);

  return { splitRatio, isDragging, setIsDragging };
}

function SplitView({
  leftPanel,
  rightPanel,
  defaultSplit = 0.3,
  minSplit = 0.2,
  maxSplit = 0.8,
  ...flex
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'row' | 'column'>('row');
  const { splitRatio, isDragging, setIsDragging } = useResizeHandle(containerRef, direction);

  // Detect direction from flex props or responsive breakpoints
  useEffect(() => {
    const updateDirection = () => {
      if (!containerRef.current) return;
      const computedStyle = window.getComputedStyle(containerRef.current);
      const flexDir = computedStyle.flexDirection;
      setDirection(flexDir === 'column' ? 'column' : 'row');
    };

    updateDirection();
    window.addEventListener('resize', updateDirection);
    return () => window.removeEventListener('resize', updateDirection);
  }, []);

  const isHorizontal = direction === 'row';
  const splitPercentage = `${splitRatio * 100}%`;

  return (
    <Row
      ref={containerRef}
      fill
      {...flex}
    >
      {/* Left/Top Panel */}
      <Column
        fill
        style={{
          [isHorizontal ? 'width' : 'height']: splitPercentage,
          [isHorizontal ? 'minWidth' : 'minHeight']: 0,
          overflow: 'auto',
        }}
      >
        {leftPanel}
      </Column>

      {/* Resize Handle */}
      <Row
        fillHeight={isHorizontal}
        fillWidth={!isHorizontal}
        minWidth={isHorizontal ? "12" : undefined}
        minHeight={!isHorizontal ? "12" : undefined}
        paddingX={isHorizontal ? "8" : undefined}
        paddingY={!isHorizontal ? "8" : undefined}
        center
        onMouseDown={() => setIsDragging(true)}
        style={{ 
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          userSelect: 'none',
        }}
      >
        <Row 
          fillWidth={isHorizontal}
          fillHeight={!isHorizontal}
          height={isHorizontal ? 8 : undefined}
          width={!isHorizontal ? 8 : undefined}>
          <Card
            fill
            background={isDragging ? "neutral-strong" : "neutral-weak"}
            border="neutral-alpha-weak"
            radius="full"
            style={{
              cursor: isHorizontal ? 'col-resize' : 'row-resize',
              transition: 'background 0.2s ease',
            }}
          />
        </Row>
      </Row>

      {/* Right/Bottom Panel */}
      <Column
        fill
        style={{
          [isHorizontal ? 'width' : 'height']: `${(1 - splitRatio) * 100}%`,
          [isHorizontal ? 'minWidth' : 'minHeight']: 0,
          overflow: 'auto',
        }}
      >
        {rightPanel}
      </Column>
    </Row>
  );
}

SplitView.displayName = "SplitView";

export { SplitView };
export type { SplitViewProps };

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CompareImage.module.scss";
import { Flex } from "./Flex.js";
import { IconButton } from "./IconButton.js";
import { Media } from "./Media.js";

interface SideContent {
  src: string | React.ReactNode;
  alt?: string;
}

interface CompareImageProps extends React.ComponentProps<typeof Flex> {
  leftContent: SideContent;
  rightContent: SideContent;
  aspectRatio?: string;
  unoptimized?: boolean;
}

const renderContent = (
  content: SideContent,
  clipPath: string,
  aspectRatio?: string,
  unoptimized?: boolean,
) => {
  if (typeof content.src === "string") {
    return (
      <Media
        src={content.src}
        alt={content.alt || ""}
        stretch
        unoptimized={unoptimized}
        aspectRatio={aspectRatio || "16/9"}
        position="absolute"
        style={{ clipPath }}
      />
    );
  }

  return (
    <Flex fill position="absolute" style={{ clipPath }}>
      {content.src}
    </Flex>
  );
};

const CompareImage = ({
  leftContent,
  rightContent,
  aspectRatio,
  unoptimized,
  ...rest
}: CompareImageProps) => {
  const [position, setPosition] = useState(50);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;

    setPosition(Math.max(0, Math.min(100, (x / containerWidth) * 100)));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const containerWidth = rect.width;

    setPosition(Math.max(0, Math.min(100, (x / containerWidth) * 100)));
  }, []);

  // The handle is a slider: arrows move it by 1%, Page Up/Down by 10%, Home
  // and End to the edges. Before, it could only be dragged with a pointer.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, (p: number) => number> = {
      ArrowLeft: (p) => p - 1,
      ArrowDown: (p) => p - 1,
      ArrowRight: (p) => p + 1,
      ArrowUp: (p) => p + 1,
      PageDown: (p) => p - 10,
      PageUp: (p) => p + 10,
      Home: () => 0,
      End: () => 100,
    };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    setPosition((p) => Math.max(0, Math.min(100, step(p))));
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <Flex
      ref={containerRef}
      aspectRatio={aspectRatio || "16/9"}
      fillWidth
      style={{ touchAction: "none" }}
      {...rest}
    >
      {renderContent(leftContent, `inset(0 ${100 - position}% 0 0)`, aspectRatio, unoptimized)}
      {renderContent(rightContent, `inset(0 0 0 ${position}%)`, aspectRatio, unoptimized)}

      {/* Hit area and visible line */}
      <Flex
        position="absolute"
        horizontal="center"
        width="3rem"
        className={styles.hitArea}
        top="0"
        bottom="0"
        style={{
          left: `${position}%`,
          cursor: "col-resize",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <Flex width="1" fillHeight background="neutral-strong" zIndex={2} />
      </Flex>
      <Flex
        radius="l"
        background="surface"
        fitHeight
        className={`${styles.dragIcon} focus-ring`}
        style={{
          left: `${position}%`,
        }}
        role="slider"
        tabIndex={0}
        aria-label="Compare images"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% ${leftContent.alt || "left image"}`}
        onKeyDown={handleKeyDown}
      >
        <IconButton
          icon="chevronsLeftRight"
          aria-hidden="true"
          tabIndex={-1}
          variant="secondary"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{ cursor: "grab" }}
        />
      </Flex>
    </Flex>
  );
};

CompareImage.displayName = "CompareImage";

export { CompareImage };

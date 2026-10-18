"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CompareImage.module.scss";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Media } from "./Media";

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    let next: ((current: number) => number) | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = (p) => p - step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = (p) => p + step;
    else if (e.key === "Home") next = () => 0;
    else if (e.key === "End") next = () => 100;
    if (!next) return;
    e.preventDefault();
    const move = next;
    setPosition((current) => Math.max(0, Math.min(100, move(current))));
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
        width={3}
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
        className={styles.dragIcon}
        style={{
          left: `${position}%`,
        }}
      >
        {/* With no onClick this rendered a div: a keyboard could not reach the
            handle at all. It is a real button exposed as a slider, moved with
            the arrow keys, Home and End. */}
        <IconButton
          icon="chevronsLeftRight"
          type="button"
          role="slider"
          aria-label="Drag to compare"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          variant="secondary"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onKeyDown={handleKeyDown}
          style={{ cursor: "grab" }}
        />
      </Flex>
    </Flex>
  );
};

CompareImage.displayName = "CompareImage";

export { CompareImage };

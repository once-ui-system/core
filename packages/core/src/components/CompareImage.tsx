"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";
import { IconButton } from "./IconButton";
import { Media } from "./Media";

export const compareImageVariants = cva("relative select-none", {
  variants: {},
});

export const compareImageHitAreaVariants = cva("-translate-x-1/2 cursor-col-resize");

export const compareImageDragIconVariants = cva(
  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] transition-none pointer-events-auto",
);

export interface SideContent {
  src: string | ReactNode;
  alt?: string;
}

export interface CompareImageProps extends Omit<FlexComponentProps, "children"> {
  leftContent: SideContent;
  rightContent: SideContent;
  aspectRatio?: string;
  unoptimized?: boolean;
  className?: string;
  style?: CSSProperties;
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
        fill
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

const CompareImage = forwardRef<HTMLDivElement, CompareImageProps>(
  ({ leftContent, rightContent, aspectRatio, unoptimized, className, style, ...rest }, ref) => {
    const [position, setPosition] = useState(50);
    const isDraggingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const handleMouseDown = useCallback(() => {
      isDraggingRef.current = true;
    }, []);

    const handleMouseUp = useCallback(() => {
      isDraggingRef.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      if (containerWidth === 0) return;
      const x = e.clientX - rect.left;

      setPosition(Math.max(0, Math.min(100, (x / containerWidth) * 100)));
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      if (containerWidth === 0) return;
      const x = e.touches[0].clientX - rect.left;

      setPosition(Math.max(0, Math.min(100, (x / containerWidth) * 100)));
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
        className={cn(compareImageVariants(), className)}
        style={{ touchAction: "none", ...style }}
        {...rest}
      >
        {renderContent(leftContent, `inset(0 ${100 - position}% 0 0)`, aspectRatio, unoptimized)}
        {renderContent(rightContent, `inset(0 0 0 ${position}%)`, aspectRatio, unoptimized)}

        {/* Hit area and visible line */}
        <Flex
          position="absolute"
          horizontal="center"
          width={3}
          className={compareImageHitAreaVariants()}
          top="0"
          bottom="0"
          style={{
            left: `${position}%`,
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
          className={compareImageDragIconVariants()}
          style={{
            left: `${position}%`,
          }}
        >
          <IconButton
            icon="chevronsLeftRight"
            variant="secondary"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{ cursor: "grab" }}
            aria-label="Drag to compare"
          />
        </Flex>
      </Flex>
    );
  },
);

CompareImage.displayName = "CompareImage";

export { CompareImage };

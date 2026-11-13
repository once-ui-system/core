"use client";

import classNames from "clsx";
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Canvas.module.css";

export interface CanvasItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** World units from the plane's origin to the item's top-left corner, before it turns. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees, clockwise, around the item's centre. */
  rotation?: number;
  /** Stacking order among the canvas's items. */
  zIndex?: number;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Anything placed on the canvas's plane, in world units. It scales with the
 * view and never re-renders when the view moves.
 *
 * A press on an item never pans the canvas or starts a selection box: hand it
 * to `useCanvasDrag` to move the item, and select it in the same handler.
 */
export function CanvasItem({
  x,
  y,
  width,
  height,
  rotation,
  zIndex,
  className,
  style,
  children,
  ref,
  ...rest
}: CanvasItemProps) {
  const placed: CSSProperties = {
    transform: `translate(${x}px, ${y}px)${rotation ? ` rotate(${rotation}deg)` : ""}`,
    width,
    height,
    zIndex,
    ...style,
  };
  return (
    <div
      ref={ref}
      data-canvas-item=""
      className={classNames(styles.item, className)}
      style={placed}
      {...rest}
    >
      {children}
    </div>
  );
}

"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Cursor.module.scss";

interface CursorProps {
  cursor: React.ReactNode;
  elementRef: React.RefObject<HTMLElement | null>;
}

/**
 * Draws `cursor` at the pointer while it is over `elementRef`, which hides
 * the native cursor (`data-cursor-follow`). It steps aside wherever the
 * native cursor is back: over a button, a link, a text field or anything
 * else inside that sets its own cursor, and over a nested element with a
 * follower of its own. Touch input never shows it.
 *
 * It moves by writing `transform` once per frame, without a React render,
 * so it keeps up with the pointer however heavy the subtree is.
 */
export const Cursor = ({
  ref,
  cursor,
  elementRef,
}: CursorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const followerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const element = elementRef?.current;
    const follower = followerRef.current;
    if (!mounted || !element || !follower) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let target: Element | null = null;
    let shown = false;

    const show = (next: boolean) => {
      if (next === shown) return;
      shown = next;
      follower.toggleAttribute("data-visible", next);
    };

    // The follower belongs on this element's own surface: not over a control
    // that shows its own cursor, and not inside a nested follower.
    const ownsTarget = (node: Element | null) => {
      if (!node || !element.contains(node)) return false;
      if (node.closest("[data-cursor-follow]") !== element) return false;
      return getComputedStyle(node).cursor === "none";
    };

    const place = () => {
      frame = 0;
      follower.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        show(false);
        return;
      }
      x = event.clientX;
      y = event.clientY;
      if (event.target !== target) {
        target = event.target as Element | null;
        show(ownsTarget(target));
      }
      if (!frame) frame = requestAnimationFrame(place);
    };

    const handleEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      place();
      target = event.target as Element | null;
      show(ownsTarget(target));
    };

    const handleLeave = () => {
      target = null;
      show(false);
    };

    element.addEventListener("pointerenter", handleEnter);
    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);
    element.addEventListener("pointercancel", handleLeave);
    window.addEventListener("blur", handleLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      element.removeEventListener("pointerenter", handleEnter);
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
      element.removeEventListener("pointercancel", handleLeave);
      window.removeEventListener("blur", handleLeave);
    };
  }, [mounted, elementRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={(node) => {
        followerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={styles.follower}
      aria-hidden="true"
    >
      {cursor}
    </div>,
    document.body,
  );
};

Cursor.displayName = "Cursor";
export default Cursor;

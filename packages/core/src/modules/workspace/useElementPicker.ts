"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  armElementPicker,
  type ElementPickerOptions,
  frameDocument,
  markElement,
  type PickedElement,
} from "./elementPicker.js";

export interface UseElementPickerOptions extends Omit<ElementPickerOptions, "onPick" | "onCancel"> {
  /** Called with the picked block; picking ends after one. */
  onPick: (picked: PickedElement) => void;
}

export interface ElementPicker {
  /** True while a pick is armed. */
  picking: boolean;
  /** Arm or disarm a pick: the toggle of a pointer button. */
  setPicking: (picking: boolean) => void;
  /** The block picked last, outlined until `clear()` or the next pick. */
  picked: PickedElement | null;
  clear: () => void;
}

/**
 * The element picker on a same-origin preview frame: `setPicking(true)` arms
 * one pick, the picked block stays outlined as the conversation's context.
 * A cross-origin frame cannot be reached, so picking there does nothing.
 */
export function useElementPicker(
  frameRef: RefObject<HTMLIFrameElement | null>,
  options: UseElementPickerOptions,
): ElementPicker {
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<PickedElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!picking) return;
    const doc = frameDocument(frameRef.current);
    if (!doc) {
      setPicking(false);
      return;
    }
    const { onPick, ...rest } = optionsRef.current;
    return armElementPicker(doc, {
      ...rest,
      onMiss: (miss) => optionsRef.current.onMiss?.(miss),
      onPick: (next) => {
        setPicking(false);
        setPicked(next);
        optionsRef.current.onPick(next);
      },
      onCancel: () => setPicking(false),
    });
  }, [picking, frameRef]);

  useEffect(
    () => (picked && !picking ? markElement(picked.element) : undefined),
    [picked, picking],
  );

  const clear = useCallback(() => setPicked(null), []);
  return { picking, setPicking, picked, clear };
}

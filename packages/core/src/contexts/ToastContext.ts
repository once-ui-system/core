"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Tone } from "../types.js";

// The context on its own, outside the public barrel, so a component can show a
// toast when there is a ToastProvider and still work when there is none.
// `useToast` (in ToastProvider) is the public hook, and throws without one.

export interface Toast {
  id: string;
  /** The palette and its icon; `danger` also interrupts the screen reader. */
  tone: Tone;
  message: ReactNode;
  action?: ReactNode;
  /**
   * How long the toast stays up, in milliseconds. Defaults to 6000. The
   * countdown pauses while the toast is hovered or holds focus; `Infinity`
   * keeps it up until it is closed.
   */
  duration?: number;
}

/**
 * The 2.x `addToast` shape: `variant` for the palette, `children` for the
 * text. Still accepted because agents keep writing it from memory, and a
 * typecheck failure costs them a whole repair turn. `addToast` normalises it.
 */
export interface LegacyToast {
  /** @deprecated Use `tone`. */
  variant?: Tone;
  tone?: Tone;
  /** @deprecated Use `message`. */
  children?: ReactNode;
  message?: ReactNode;
  action?: ReactNode;
  duration?: number;
}

/** A toast in its 3.0 shape, from either shape `addToast` takes. */
export const normalizeToast = (toast: Omit<Toast, "id"> | LegacyToast): Omit<Toast, "id"> => {
  const { variant, children, tone, message, ...rest } = toast as LegacyToast;
  return { ...rest, tone: tone ?? variant ?? "neutral", message: message ?? children };
};

export interface ToastContextProps {
  toasts: Toast[];
  /** Shows a toast and returns its id, which `removeToast` takes. */
  addToast: (toast: Omit<Toast, "id"> | LegacyToast) => string;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

/** The nearest ToastProvider's toasts, or `undefined` outside one. */
export const useOptionalToast = () => useContext(ToastContext);

"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../classes/utils";
import { useLayout } from "../contexts";
import type { ToastPosition } from "../types";
import { Column } from "./Column";
import { Row } from "./Row";
import { Toast } from "./Toast";

export const toasterContainerVariants = cva("fixed left-1/2 -translate-x-1/2", {
  variants: {
    position: {
      top: "top-l",
      bottom: "bottom-l",
    },
  },
  defaultVariants: {
    position: "bottom",
  },
});

export const toastWrapperVariants = cva("transition-[transform,opacity] duration-300", {
  variants: {
    position: {
      top: "top-0",
      bottom: "bottom-0",
    },
  },
  defaultVariants: {
    position: "bottom",
  },
});

export const toastAnimationVariants = cva("", {
  variants: {
    position: {
      top: "animate-fadeInTop",
      bottom: "animate-fadeInBottom",
    },
  },
  defaultVariants: {
    position: "bottom",
  },
});

export const toasterVariants = toasterContainerVariants;

export interface ToastItem {
  id: string;
  variant: "success" | "danger" | "warning" | "info";
  message: ReactNode;
  action?: ReactNode;
}

export interface ToasterProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
  xl?: ToastPosition;
  l?: ToastPosition;
  m?: ToastPosition;
  s?: ToastPosition;
  xs?: ToastPosition;
  className?: string;
  style?: CSSProperties;
}

const Toaster = forwardRef<HTMLDivElement, ToasterProps>(
  ({ toasts, removeToast, xl, l, m, s, xs, className, style }, ref) => {
    const [mounted, setMounted] = useState(false);
    const { currentBreakpoint } = useLayout();

    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const getCascadedPosition = (): ToastPosition => {
      const breakpointOrder = ["xl", "l", "m", "s", "xs"];
      const breakpointProps = { xl, l, m, s, xs };
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

      let activePosition: ToastPosition = "bottom";

      if (currentIndex === -1) return activePosition;

      for (let i = 0; i <= currentIndex; i++) {
        const bp = breakpointOrder[i] as keyof typeof breakpointProps;
        if (breakpointProps[bp]) {
          activePosition = breakpointProps[bp] as ToastPosition;
        }
      }

      return activePosition;
    };

    const actualPosition = getCascadedPosition();
    const isTop = actualPosition === "top";

    return createPortal(
      <Column
        ref={ref}
        zIndex={10}
        fillWidth
        maxWidth={32}
        position="fixed"
        className={cn(toasterContainerVariants({ position: actualPosition }), className)}
        style={style}
      >
        {toasts.map((toast, index, array) => {
          const reverseIndex = array.length - 1 - index;
          const yDirection = isTop ? -1 : 1;

          return (
            <Row
              padding="4"
              fillWidth
              position="absolute"
              key={toast.id}
              className={cn(toastWrapperVariants({ position: actualPosition }))}
              style={{
                transformOrigin: isTop ? "top center" : "bottom center",
                transform: `scale(${1 - reverseIndex * 0.05}) translateY(${yDirection * (1 - reverseIndex * 10)}%)`,
                opacity: reverseIndex === 0 ? 1 : 0.9,
              }}
            >
              <Toast
                className={cn(toastAnimationVariants({ position: actualPosition }))}
                variant={toast.variant}
                onClose={() => removeToast(toast.id)}
                action={toast.action}
              >
                {toast.message}
              </Toast>
            </Row>
          );
        })}
      </Column>,
      document.body,
    );
  },
);

Toaster.displayName = "Toaster";

export { Toaster };

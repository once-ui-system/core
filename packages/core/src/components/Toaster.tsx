"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLayout } from "../contexts/LayoutProvider.js";
import { ToastPosition, Tone } from "../types.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Toast } from "./Toast.js";
import styles from "./Toaster.module.scss";

interface ToasterProps {
  toasts: {
    id: string;
    tone: Tone;
    message: React.ReactNode;
    action?: React.ReactNode;
    duration?: number;
  }[];
  removeToast: (id: string) => void;
  xl?: ToastPosition;
  l?: ToastPosition;
  m?: ToastPosition;
  s?: ToastPosition;
  xs?: ToastPosition;
}

const Toaster = forwardRef<HTMLDivElement, ToasterProps>(
  ({ toasts, removeToast, xl, l, m, s, xs }, ref) => {
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
        zIndex={10}
        fillWidth
        maxWidth="32rem"
        position="fixed"
        className={classNames(styles.toastContainer, styles[actualPosition])}
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
              className={classNames(styles.toastWrapper, styles[actualPosition])}
              style={{
                transformOrigin: isTop ? "top center" : "bottom center",
                transform: `scale(${1 - reverseIndex * 0.05}) translateY(${yDirection * (1 - reverseIndex * 10)}%)`,
                opacity: reverseIndex === 0 ? 1 : 0.9,
              }}
            >
              <Toast
                className={classNames(styles.toastAnimation, styles[`animation-${actualPosition}`])}
                tone={toast.tone}
                onClose={() => removeToast(toast.id)}
                action={toast.action}
                duration={toast.duration}
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

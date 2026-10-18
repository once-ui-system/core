"use client";

import React, { ReactNode, useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import { Toaster } from "../components/Toaster.js";
import { ToastPosition } from "../types.js";
import { type Toast, ToastContext } from "./ToastContext.js";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastProvider: React.FC<{
  children: ReactNode;
  xl?: ToastPosition;
  l?: ToastPosition;
  m?: ToastPosition;
  s?: ToastPosition;
  xs?: ToastPosition;
}> = ({ children, xl, l, m, s, xs }) => {
  // Use the same Toast interface type for the state
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Ids are unique per provider by construction: a random suffix could repeat,
  // and a repeated id is a repeated React key and a `removeToast` that hits
  // two toasts.
  const idPrefix = useId();
  const count = useRef(0);

  // Both callbacks keep one identity for the provider's lifetime. They used to
  // be recreated on every render, and every toast re-renders the provider, so
  // a consumer effect that listed `addToast` as a dependency re-ran each time
  // a toast appeared: in Kinetic a "saved" toast re-ran the effect that loads
  // the document and put the server's copy over the user's edits.
  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      count.current += 1;
      const id = `${idPrefix}toast-${count.current}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      return id;
    },
    [idPrefix],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} xl={xl} l={l} m={m} s={s} xs={xs} />
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = "ToastProvider";

export { ToastProvider };

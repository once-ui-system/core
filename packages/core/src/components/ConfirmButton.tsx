"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Button, type ButtonProps } from "./Button.js";
import styles from "./ConfirmButton.module.scss";
import { VisuallyHidden } from "./VisuallyHidden.js";

/** The words a ConfirmButton writes and says while it waits, for another language. */
interface ConfirmButtonLabels {
  /** The armed label, in place of `label` (`"twice"`). */
  confirm: string;
  /** What a screen reader hears once armed. */
  armed: string;
  /** The label while held (`"hold"`). */
  holding: string;
}

const defaultLabels: ConfirmButtonLabels = {
  confirm: "Press again to confirm",
  armed: "Press again to confirm, or Escape to cancel.",
  holding: "Keep holding…",
};

interface ConfirmButtonProps extends Omit<ButtonProps, "onClick" | "href"> {
  /** Runs once the press is confirmed: the second press, or the hold run to its end. */
  onConfirm: () => void;
  /**
   * How the press is confirmed:
   *
   * - `"twice"` (the default): the first press arms the button and its label
   *   asks for a second; a second press within `timeout` runs `onConfirm`.
   *   Escape, moving focus away or the time running out disarms it.
   * - `"hold"`: hold the button (pointer, Space or Enter) for `holdDuration`
   *   while it fills; letting go early cancels.
   */
  mode?: "twice" | "hold";
  /**
   * The armed label (`"Press again to confirm"`), what a screen reader hears
   * once armed, and the label while held (`"Keep holding…"`).
   */
  labels?: Partial<ConfirmButtonLabels>;
  /** How long the button stays armed, in ms. Defaults to 4000. */
  timeout?: number;
  /** How long to hold, in ms. Defaults to 1500. */
  holdDuration?: number;
  /** Armed (`"twice"`), controlled. */
  armed?: boolean;
  defaultArmed?: boolean;
  onArmedChange?: (armed: boolean) => void;
  /** The tone the armed button turns to. Defaults to `"danger"`. */
  armedTone?: ButtonProps["tone"];
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * A button for an action that is hard to take back: a trip, a delete, a
 * send. One press never does it. In `"twice"` mode the first press arms it
 * (the label changes, it turns `armedTone`, a bar runs down the time left)
 * and a second press does it; a second press faster than a double click is
 * ignored, so a double click cannot confirm by accident. In `"hold"` mode it
 * fills while held and acts when full.
 *
 * Every change is written in the label, which a screen reader hears as it
 * changes, so nothing rests on the colour or the bar.
 */
const ConfirmButton = ({
  onConfirm,
  mode = "twice",
  label,
  labels: labelsProp,
  timeout = 4000,
  holdDuration = 1500,
  armed: armedProp,
  defaultArmed = false,
  onArmedChange,
  armedTone = "danger",
  tone,
  variant = "secondary",
  disabled,
  className,
  style,
  onKeyDown,
  onKeyUp,
  onBlur,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ref,
  ...rest
}: ConfirmButtonProps) => {
  const labels = mergeLabels(defaultLabels, labelsProp);
  const [armed, setArmed] = useControllableState({
    value: armedProp,
    defaultValue: defaultArmed,
    onChange: onArmedChange,
  });
  const [holding, setHolding] = useState(false);
  const armedAt = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Armed, the time runs out on its own.
  useEffect(() => {
    if (!armed || mode !== "twice") return;
    armedAt.current = Date.now();
    const timer = setTimeout(() => setArmed(false), timeout);
    return () => clearTimeout(timer);
  }, [armed, mode, timeout, setArmed]);

  useEffect(() => () => clearTimeout(holdTimer.current), []);

  const startHold = useCallback(() => {
    if (disabled || holding) return;
    setHolding(true);
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, holdDuration);
  }, [disabled, holding, holdDuration, onConfirm]);
  const stopHold = useCallback(() => {
    clearTimeout(holdTimer.current);
    setHolding(false);
  }, []);

  const onClick = () => {
    if (mode !== "twice" || disabled) return;
    if (!armed) return setArmed(true);
    // A double click's second press is not a confirmation.
    if (Date.now() - armedAt.current < 350) return;
    setArmed(false);
    onConfirm();
  };

  const hot = mode === "twice" ? armed : holding;
  const shown =
    mode === "twice" ? (armed ? labels.confirm : label) : holding ? labels.holding : label;

  return (
    <>
      <Button
        ref={ref}
        {...rest}
        label={shown}
        variant={hot ? "primary" : variant}
        tone={hot ? armedTone : tone}
        disabled={disabled}
        data-armed={hot || undefined}
        className={classNames(
          styles.confirm,
          mode === "twice" && armed && styles.armed,
          holding && styles.holding,
          className,
        )}
        style={
          {
            "--confirm-timeout": `${timeout}ms`,
            "--confirm-hold": `${holdDuration}ms`,
            ...style,
          } as React.CSSProperties
        }
        onClick={onClick}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          if (event.key === "Escape" && armed) {
            event.stopPropagation();
            setArmed(false);
          }
          if (mode === "hold" && (event.key === " " || event.key === "Enter")) {
            event.preventDefault();
            if (!event.repeat) startHold();
          }
        }}
        onKeyUp={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyUp?.(event);
          if (mode === "hold" && (event.key === " " || event.key === "Enter")) stopHold();
        }}
        onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
          onBlur?.(event);
          if (armed) setArmed(false);
          stopHold();
        }}
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerDown?.(event);
          if (mode === "hold" && event.button === 0) startHold();
        }}
        onPointerUp={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerUp?.(event);
          if (mode === "hold") stopHold();
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerLeave?.(event);
          if (mode === "hold") stopHold();
        }}
        onPointerCancel={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerCancel?.(event);
          if (mode === "hold") stopHold();
        }}
      />
      <VisuallyHidden as="span" role="status">
        {mode === "twice" && armed ? labels.armed : ""}
      </VisuallyHidden>
    </>
  );
};

ConfirmButton.displayName = "ConfirmButton";

export type { ConfirmButtonLabels, ConfirmButtonProps };
export { ConfirmButton };

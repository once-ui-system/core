"use client";

import classNames from "clsx";
import React, { forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { Speed } from "../types.js";
import { speedFactor } from "../utils/speed.js";

const defaultCharset = ["X", "$", "@", "a", "H", "z", "o", "0", "y", "#", "?", "*", "0", "1", "+"];

function getRandomCharacter(charset: string[]): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

function createEventHandler(
  originalText: string,
  setText: React.Dispatch<React.SetStateAction<string>>,
  inProgress: boolean,
  setInProgress: React.Dispatch<React.SetStateAction<boolean>>,
  speed: Speed,
  charset: string[],
  setHasAnimated?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  // The designed pace (speed 1): a 30ms step and 300ms of scrambling first.
  const factor = speedFactor(speed);
  const BASE_DELAY = 30 / factor;
  const REVEAL_DELAY = 30 / factor;
  const INITIAL_RANDOM_DURATION = 300 / factor;

  const generateRandomText = () =>
    originalText
      .split("")
      .map((char) => (char === " " ? " " : getRandomCharacter(charset)))
      .join("");

  return async () => {
    if (inProgress) return;

    setInProgress(true);

    let randomizedText = generateRandomText();
    const endTime = Date.now() + INITIAL_RANDOM_DURATION;

    while (Date.now() < endTime) {
      setText(randomizedText);
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY));
      randomizedText = generateRandomText();
    }

    for (let i = 0; i < originalText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, REVEAL_DELAY));
      setText(`${originalText.substring(0, i + 1)}${randomizedText.substring(i + 1)}`);
    }

    setInProgress(false);
    if (setHasAnimated) {
      setHasAnimated(true);
    }
  };
}

type LetterFxProps = {
  children: ReactNode;
  trigger?: "hover" | "instant" | "custom";
  /**
   * A multiplier on the scramble's pace (`2` is twice as fast), or
   * `"slow"`/`"medium"`/`"fast"` (0.5, 1, 2).
   */
  speed?: Speed;
  charset?: string[];
  onTrigger?: (triggerFn: () => void) => void;
  className?: string;
  style?: React.CSSProperties;
};

const LetterFx = forwardRef<HTMLSpanElement, LetterFxProps>(
  (
    {
      children,
      trigger = "hover",
      speed = "medium",
      charset = defaultCharset,
      onTrigger,
      className,
      style,
    },
    ref,
  ) => {
    const [text, setText] = useState<string>(typeof children === "string" ? children : "");
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);
    const originalText = useRef<string>(typeof children === "string" ? children : "");

    const eventHandler = useCallback(() => {
      createEventHandler(
        originalText.current,
        setText,
        inProgress,
        setInProgress,
        speed,
        charset,
        trigger === "instant" ? setHasAnimated : undefined,
      )();
    }, [inProgress, speed, charset, trigger, setHasAnimated]);

    useEffect(() => {
      if (typeof children === "string") {
        setText(children);
        originalText.current = children;

        if (trigger === "instant" && !hasAnimated) {
          eventHandler();
        }
      }
    }, [children, trigger, eventHandler, hasAnimated]);

    useEffect(() => {
      if (trigger === "custom" && onTrigger) {
        onTrigger(eventHandler);
      }
    }, [trigger, onTrigger, eventHandler]);

    return (
      <span
        ref={ref}
        className={classNames(className)}
        style={style}
        onMouseOver={trigger === "hover" ? eventHandler : undefined}
      >
        {text}
      </span>
    );
  },
);

LetterFx.displayName = "LetterFx";

export { LetterFx };

"use client";

import classNames from "clsx";
import React, { forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { prefersReducedMotionNow } from "../internal/reducedMotion";
import { VisuallyHidden } from "./VisuallyHidden";

const defaultCharset = ["X", "$", "@", "a", "H", "z", "o", "0", "y", "#", "?", "*", "0", "1", "+"];

function getRandomCharacter(charset: ArrayLike<string>): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

function createEventHandler(
  originalText: string,
  setText: React.Dispatch<React.SetStateAction<string>>,
  inProgress: boolean,
  setInProgress: React.Dispatch<React.SetStateAction<boolean>>,
  speed: "fast" | "medium" | "slow",
  charset: ArrayLike<string>,
  setHasAnimated?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const speedSettings = {
    fast: {
      BASE_DELAY: 10,
      REVEAL_DELAY: 10,
      INITIAL_RANDOM_DURATION: 100,
    },
    medium: {
      BASE_DELAY: 30,
      REVEAL_DELAY: 30,
      INITIAL_RANDOM_DURATION: 300,
    },
    slow: {
      BASE_DELAY: 60,
      REVEAL_DELAY: 60,
      INITIAL_RANDOM_DURATION: 600,
    },
  };

  const { BASE_DELAY, REVEAL_DELAY, INITIAL_RANDOM_DURATION } = speedSettings[speed];

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
  speed?: "fast" | "medium" | "slow";
  /** The characters to cycle through: an array, or a string read one character at a time. */
  charset?: string | string[];
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
    const { prefersReducedMotion } = useReducedMotion();

    const eventHandler = useCallback(() => {
      // Under reduced motion there is no scramble: the text stays as it is.
      if (prefersReducedMotion || prefersReducedMotionNow()) {
        if (!inProgress) setText(originalText.current);
        if (trigger === "instant") setHasAnimated(true);
        return;
      }
      createEventHandler(
        originalText.current,
        setText,
        inProgress,
        setInProgress,
        speed,
        charset,
        trigger === "instant" ? setHasAnimated : undefined,
      )();
    }, [inProgress, speed, charset, trigger, setHasAnimated, prefersReducedMotion]);

    // Only new text resets the display. This used to share an effect with the
    // instant trigger, so every new `eventHandler` (each render, with an inline
    // `charset` array) put the original text back over the scramble.
    useEffect(() => {
      if (typeof children === "string") {
        setText(children);
        originalText.current = children;
      }
    }, [children]);

    useEffect(() => {
      if (typeof children === "string" && trigger === "instant" && !hasAnimated) {
        eventHandler();
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
        {/* While it scrambles, a screen reader gets the real words once
            instead of every random frame. At rest the text is just text. */}
        {typeof children !== "string" ? (
          children
        ) : inProgress ? (
          <>
            <VisuallyHidden>{originalText.current}</VisuallyHidden>
            <span aria-hidden="true">{text}</span>
          </>
        ) : (
          text
        )}
      </span>
    );
  },
);

LetterFx.displayName = "LetterFx";

export { LetterFx };

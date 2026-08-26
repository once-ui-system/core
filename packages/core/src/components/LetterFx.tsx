"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, FocusEvent, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";

export const defaultCharset = [
  "X",
  "$",
  "@",
  "a",
  "H",
  "z",
  "o",
  "0",
  "y",
  "#",
  "?",
  "*",
  "0",
  "1",
  "+",
] as const;

export const DEFAULT_CHARSET = defaultCharset;

export const SPEED_SETTINGS = {
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
} as const;

export const letterFxVariants = cva("inline-block");
const LETTER_FX_BASE = letterFxVariants();

export type LetterFxTrigger = "hover" | "instant" | "custom";
export type LetterFxSpeed = "fast" | "medium" | "slow";

export interface LetterFxProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  trigger?: LetterFxTrigger;
  speed?: LetterFxSpeed;
  charset?: string[] | string | readonly string[];
  onTrigger?: (triggerFn: () => void) => void;
  className?: string;
  style?: CSSProperties;
}

function getRandomCharacter(charset: string[] | string | readonly string[]): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

function generateRandomText(
  source: string,
  charset: string[] | string | readonly string[],
): string {
  return source
    .split("")
    .map((char) => (char === " " ? " " : getRandomCharacter(charset)))
    .join("");
}

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
      onMouseOver,
      onFocus,
      ...rest
    },
    ref,
  ) => {
    const rawText =
      typeof children === "string"
        ? children
        : typeof children === "number"
          ? String(children)
          : "";

    const [text, setText] = useState<string>(rawText);

    const originalTextRef = useRef<string>(rawText);
    const inProgressRef = useRef<boolean>(false);
    const hasAnimatedRef = useRef<boolean>(false);
    const isMountedRef = useRef<boolean>(true);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    useEffect(() => {
      originalTextRef.current = rawText;
      if (!inProgressRef.current) {
        setText(rawText);
      }
    }, [rawText]);

    const eventHandler = useCallback(() => {
      if (inProgressRef.current) return;

      const targetText = originalTextRef.current;
      if (!targetText) return;

      inProgressRef.current = true;

      const activeCharset = charset && charset.length > 0 ? charset : defaultCharset;
      const speedConfig = SPEED_SETTINGS[speed] || SPEED_SETTINGS.medium;
      const { BASE_DELAY, REVEAL_DELAY, INITIAL_RANDOM_DURATION } = speedConfig;

      const run = async () => {
        let randomizedText = generateRandomText(targetText, activeCharset);
        const endTime = Date.now() + INITIAL_RANDOM_DURATION;

        while (Date.now() < endTime) {
          if (!isMountedRef.current) return;
          setText(randomizedText);
          await new Promise((resolve) => setTimeout(resolve, BASE_DELAY));
          randomizedText = generateRandomText(targetText, activeCharset);
        }

        for (let i = 0; i < targetText.length; i++) {
          if (!isMountedRef.current) return;
          await new Promise((resolve) => setTimeout(resolve, REVEAL_DELAY));
          if (!isMountedRef.current) return;
          setText(`${targetText.substring(0, i + 1)}${randomizedText.substring(i + 1)}`);
        }

        if (isMountedRef.current) {
          setText(targetText);
          inProgressRef.current = false;
          if (trigger === "instant") {
            hasAnimatedRef.current = true;
          }
        }
      };

      run();
    }, [speed, charset, trigger]);

    useEffect(() => {
      if (trigger === "instant" && !hasAnimatedRef.current) {
        eventHandler();
      }
    }, [trigger, eventHandler]);

    useEffect(() => {
      if (trigger === "custom" && onTrigger) {
        onTrigger(eventHandler);
      }
    }, [trigger, onTrigger, eventHandler]);

    const handleMouseOver = (event: MouseEvent<HTMLSpanElement>) => {
      if (trigger === "hover") {
        eventHandler();
      }
      onMouseOver?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLSpanElement>) => {
      if (trigger === "hover") {
        eventHandler();
      }
      onFocus?.(event);
    };

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: LetterFx attaches presentation-only hover/focus visual effect handlers
      <span
        ref={ref}
        className={cn(LETTER_FX_BASE, className)}
        style={style}
        onMouseOver={handleMouseOver}
        onFocus={handleFocus}
        {...rest}
      >
        {text}
      </span>
    );
  },
);

LetterFx.displayName = "LetterFx";

export { LetterFx };

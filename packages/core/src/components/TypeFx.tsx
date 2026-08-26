"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import type { TextComponentProps } from "./Text";
import { Text } from "./Text";

export const typeFxVariants = cva("inline-block");
const TYPE_FX_BASE = typeFxVariants();

export const typeFxCursorVariants = cva("opacity-50 select-none");
const TYPE_FX_CURSOR_BASE = typeFxCursorVariants();

export interface TypeFxProps extends Omit<TextComponentProps<"span">, "children"> {
  words: string | string[];
  speed?: number;
  delay?: number;
  hold?: number;
  trigger?: "instant" | "custom";
  onTrigger?: (triggerFn: () => void) => void;
  loop?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const TypeFx = forwardRef<HTMLSpanElement, TypeFxProps>(
  (
    {
      words,
      speed = 100,
      delay = 0,
      hold = 2000,
      trigger = "instant",
      onTrigger,
      loop = true,
      className,
      style,
      children,
      ...textProps
    },
    ref,
  ) => {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(trigger === "instant");

    const runIdRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const wordsHash = JSON.stringify(Array.isArray(words) ? words : [words]);

    const startTyping = useCallback(() => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const currentRunId = ++runIdRef.current;
      setHasStarted(true);
      setIsComplete(false);
      setDisplayText("");

      const wordsArray: string[] = JSON.parse(wordsHash);
      if (wordsArray.length === 0) {
        setIsComplete(true);
        return;
      }

      const isSingleWord = wordsArray.length === 1;

      const sleep = (ms: number) =>
        new Promise<boolean>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            resolve(runIdRef.current === currentRunId);
          }, ms);
        });

      const run = async () => {
        if (delay > 0) {
          const ok = await sleep(delay);
          if (!ok) return;
        }

        let currentIndex = 0;

        while (runIdRef.current === currentRunId) {
          const currentWord = wordsArray[currentIndex] ?? "";

          for (let i = 0; i <= currentWord.length; i++) {
            if (runIdRef.current !== currentRunId) return;
            setDisplayText(currentWord.substring(0, i));
            const ok = await sleep(speed);
            if (!ok) return;
          }

          if (isSingleWord) {
            if (runIdRef.current === currentRunId) {
              setIsComplete(true);
            }
            return;
          }

          const okHold = await sleep(hold);
          if (!okHold) return;

          for (let i = currentWord.length; i >= 0; i--) {
            if (runIdRef.current !== currentRunId) return;
            setDisplayText(currentWord.substring(0, i));
            const ok = await sleep(speed / 2);
            if (!ok) return;
          }

          currentIndex = (currentIndex + 1) % wordsArray.length;

          if (!loop && currentIndex === 0) {
            if (runIdRef.current === currentRunId) {
              setIsComplete(true);
            }
            return;
          }

          const okPause = await sleep(speed);
          if (!okPause) return;
        }
      };

      run();
    }, [wordsHash, speed, delay, hold, loop]);

    useEffect(() => {
      if (trigger === "instant") {
        startTyping();
      } else {
        setHasStarted(false);
        setIsComplete(false);
        setDisplayText("");
      }
    }, [trigger, startTyping]);

    useEffect(() => {
      if (trigger === "custom" && onTrigger) {
        onTrigger(startTyping);
      }
    }, [trigger, onTrigger, startTyping]);

    useEffect(() => {
      return () => {
        runIdRef.current++;
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, []);

    const showCursor = hasStarted && !isComplete;

    return (
      <Text ref={ref} className={cn(TYPE_FX_BASE, className)} style={style} {...textProps}>
        {children}
        {displayText}
        {showCursor && (
          <span className={TYPE_FX_CURSOR_BASE} aria-hidden="true">
            |
          </span>
        )}
      </Text>
    );
  },
);

TypeFx.displayName = "TypeFx";

export { TypeFx };

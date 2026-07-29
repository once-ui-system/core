"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Text } from ".";

export interface TypeFxProps extends Omit<React.ComponentProps<typeof Text>, 'children'> {
  words: string | string[];
  speed?: number;
  delay?: number;
  hold?: number;
  trigger?: "instant" | "custom";
  onTrigger?: (triggerFn: () => void) => void;
  loop?: boolean;
  children?: React.ReactNode;
}

const TypeFx = forwardRef<HTMLSpanElement, TypeFxProps>(({
  words,
  speed = 100,
  delay = 0,
  hold = 2000,
  trigger = "instant",
  onTrigger,
  loop = true,
  children,
  ...text
}, ref) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [triggered, setTriggered] = useState(trigger === "instant");
  const timeoutRef = useRef<number | null>(null);

  const wordsHash = JSON.stringify(Array.isArray(words) ? words : [words]);

  useEffect(() => {
    if (trigger === "instant") setTriggered(true);
  }, [trigger]);

  useEffect(() => {
    if (trigger === "custom" && onTrigger) {
      onTrigger(() => setTriggered(true));
    }
  }, [trigger, onTrigger]);

  useEffect(() => {
    if (!triggered) return;

    let active = true;
    let pendingResolve: (() => void) | null = null;

    setDisplayText("");
    setIsComplete(false);

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        pendingResolve = resolve;
        timeoutRef.current = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      const wordsArray: string[] = JSON.parse(wordsHash);
      const isSingleWord = wordsArray.length === 1;

      if (delay > 0) {
        await sleep(delay);
        if (!active) return;
      }

      let currentIndex = 0;

      while (active) {
        const currentWord = wordsArray[currentIndex];

        for (let i = 0; i <= currentWord.length; i++) {
          if (!active) return;
          setDisplayText(currentWord.substring(0, i));
          await sleep(speed);
        }

        if (isSingleWord) {
          if (active) setIsComplete(true);
          return;
        }

        if (!active) return;
        await sleep(hold);

        for (let i = currentWord.length; i >= 0; i--) {
          if (!active) return;
          setDisplayText(currentWord.substring(0, i));
          await sleep(speed / 2);
        }

        currentIndex = (currentIndex + 1) % wordsArray.length;

        if (!loop && currentIndex === 0) return;

        if (!active) return;
        await sleep(speed);
      }
    };

    run();

    return () => {
      active = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      if (pendingResolve) pendingResolve();
    };
  }, [triggered, wordsHash, speed, delay, hold, loop]);

  return (
    <Text {...text}>
      {children}
      {displayText}
      {!isComplete && <span style={{ opacity: 0.5 }}>|</span>}
    </Text>
  );
});

TypeFx.displayName = "TypeFx";

export { TypeFx };

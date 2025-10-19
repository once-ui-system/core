"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

const TypeFx: React.FC<TypeFxProps> = ({
  words,
  speed = 100,
  delay = 0,
  hold = 2000,
  trigger = "instant",
  onTrigger,
  loop = true,
  children,
  ...text
}) => {
    const [displayText, setDisplayText] = useState<string>("");
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const isRunningRef = useRef<boolean>(false);
    const timeoutRef = useRef<number | null>(null);
    const hasTriggeredRef = useRef<boolean>(false);
    const prevWordsRef = useRef<string | string[]>(words);
    
    // Store config in refs to avoid re-creating typeText on every prop change
    const configRef = useRef({ speed, delay, hold, loop });
    configRef.current = { speed, delay, hold, loop };
    
    const wordsRef = useRef<string[]>(Array.isArray(words) ? words : [words]);
    wordsRef.current = Array.isArray(words) ? words : [words];

    const typeText = useCallback(async () => {
      if (isRunningRef.current) return;
      
      hasTriggeredRef.current = true;
      isRunningRef.current = true;
      
      const wordsArray = wordsRef.current;
      const isSingleWord = wordsArray.length === 1;
      const { speed, delay, hold, loop } = configRef.current;

      // Initial delay
      if (delay > 0) {
        await new Promise((resolve) => {
          timeoutRef.current = window.setTimeout(resolve, delay);
        });
      }

      let currentIndex = 0;

      while (true) {
        const currentWord = wordsArray[currentIndex];

        // Type out the word
        for (let i = 0; i <= currentWord.length; i++) {
          if (!isRunningRef.current) return;
          setDisplayText(currentWord.substring(0, i));
          await new Promise((resolve) => {
            timeoutRef.current = window.setTimeout(resolve, speed);
          });
        }

        // If single word, stop here
        if (isSingleWord) {
          setIsComplete(true);
          isRunningRef.current = false;
          return;
        }

        // Hold the complete text
        await new Promise((resolve) => {
          timeoutRef.current = window.setTimeout(resolve, hold);
        });

        // Delete the word
        for (let i = currentWord.length; i >= 0; i--) {
          if (!isRunningRef.current) return;
          setDisplayText(currentWord.substring(0, i));
          await new Promise((resolve) => {
            timeoutRef.current = window.setTimeout(resolve, speed / 2); // Delete faster
          });
        }

        // Move to next word
        currentIndex = (currentIndex + 1) % wordsArray.length;

        // If not looping and we're back at the start, stop
        if (!loop && currentIndex === 0) {
          isRunningRef.current = false;
          return;
        }

        // Small pause before typing next word
        await new Promise((resolve) => {
          timeoutRef.current = window.setTimeout(resolve, speed);
        });
      }
    }, []); // Empty deps since all values are in refs

    useEffect(() => {
      if (trigger === "instant" && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        typeText();
      } else if (trigger === "custom" && onTrigger && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTrigger(typeText);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount - typeText is stable via useCallback

    // Reset when words actually change
    useEffect(() => {
      // Check if words actually changed
      const wordsChanged = prevWordsRef.current !== words;
      
      if (!wordsChanged) return;
      
      prevWordsRef.current = words;
      
      isRunningRef.current = false;
      hasTriggeredRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      setDisplayText("");
      setIsComplete(false);
    }, [words]);

  return (
    <Text {...text}>
      {children}
      {displayText}
      {!isComplete && <span style={{ opacity: 0.5 }}>|</span>}
    </Text>
  );
};

TypeFx.displayName = "TypeFx";

export { TypeFx };

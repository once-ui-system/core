"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef, memo, useMemo } from "react";
import { cn } from "../classes/utils";
import { Text, type TextComponentProps } from "./Text";

export type AnimationState = "entering" | "visible" | "exiting";

export const fadingLettersFxVariants = cva("contents");
const FADING_LETTERS_FX_BASE = fadingLettersFxVariants();

export const fadingLettersWordVariants = cva("inline-flex mr-[0.35em]");
const FADING_LETTERS_WORD_BASE = fadingLettersWordVariants();

export const fadingLettersLetterVariants = cva("inline-block will-change-transform", {
  variants: {
    state: {
      entering: "animate-letterFadeIn [animation-delay:var(--entry-delay,0s)]",
      visible: "",
      exiting: "animate-letterFadeOut [animation-delay:var(--exit-delay,0s)]",
    },
  },
  defaultVariants: {
    state: "visible",
  },
});

const LETTER_CLASSES: Record<AnimationState, string> = {
  entering: fadingLettersLetterVariants({ state: "entering" }),
  visible: fadingLettersLetterVariants({ state: "visible" }),
  exiting: fadingLettersLetterVariants({ state: "exiting" }),
};

export interface FadingLettersFxProps extends TextComponentProps<"span"> {
  text: string;
  animationState: AnimationState;
  messageIdx?: number;
}

const FadingLettersFx = forwardRef<HTMLSpanElement, FadingLettersFxProps>(
  ({ text, animationState, messageIdx = 0, className, style, ...textProps }, ref) => {
    const wordsData = useMemo(() => {
      const words = text.split(" ");
      const lineBaseDelay = messageIdx * 2500;

      return words.map((word, wordIdx) => {
        const letters = word.split("");
        const wordBaseDelay = lineBaseDelay + wordIdx * 200;

        return letters.map((letter, letterIdx) => {
          const entryDelay = wordBaseDelay + letterIdx * 40;
          const exitDelay = Math.random() * 400;

          return {
            letter,
            key: `${wordIdx}-${letterIdx}`,
            style: {
              "--entry-delay": `${entryDelay}ms`,
              "--exit-delay": `${exitDelay}ms`,
            } as CSSProperties,
          };
        });
      });
    }, [text, messageIdx]);

    const letterClass = LETTER_CLASSES[animationState] || LETTER_CLASSES.visible;

    const renderedWords = useMemo(
      () =>
        wordsData.map((letters, wordIdx) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed word position in text rendering
            key={`word-${wordIdx}`}
            className={FADING_LETTERS_WORD_BASE}
          >
            {letters.map(({ letter, key, style: letterStyle }) => (
              <span key={key} className={letterClass} style={letterStyle} suppressHydrationWarning>
                {letter}
              </span>
            ))}
          </span>
        )),
      [wordsData, letterClass],
    );

    return (
      <Text
        ref={ref}
        className={cn(FADING_LETTERS_FX_BASE, className)}
        style={{ display: "contents", ...style }}
        {...textProps}
      >
        {renderedWords}
      </Text>
    );
  },
);

FadingLettersFx.displayName = "FadingLettersFx";

export default memo(FadingLettersFx);
export { FadingLettersFx };

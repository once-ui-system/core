"use client";

import { Text } from "./Text";
import { ComponentProps } from "react";
import styles from "./FadingLettersFx.module.scss";

type AnimationState = "entering" | "visible" | "exiting";

interface FadingLettersFxProps extends ComponentProps<typeof Text> {
  text: string;
  animationState: AnimationState;
  messageIdx?: number;
}

function FadingLettersFx({
  text,
  animationState,
  messageIdx = 0,
  ...textProps
}: FadingLettersFxProps) {
  const renderTextWithLetters = () => {
    const words = text.split(" ");
    const lineBaseDelay = messageIdx * 2500;

    return words.map((word, wordIdx) => {
      const letters = word.split("");
      const wordLetters = letters.map((letter, letterIdx) => {
        const wordBaseDelay = lineBaseDelay + wordIdx * 200;
        const entryDelay = wordBaseDelay + letterIdx * 40;
        const exitDelay = Math.random() * 400;

        return (
          <span
            key={`${wordIdx}-${letterIdx}`}
            className={`${styles.letter} ${
              animationState === "entering" ? styles.entering : ""
            } ${animationState === "exiting" ? styles.exiting : ""}`}
            style={{
              "--entry-delay": `${entryDelay}ms`,
              "--exit-delay": `${exitDelay}ms`,
            } as React.CSSProperties}
            data-letter={letter}
            suppressHydrationWarning
          >
            <span className={styles.glyph}>{letter}</span>
          </span>
        );
      });

      return (
        <span key={wordIdx} className={styles.word}>
          {wordLetters}
        </span>
      );
    });
  };

  return (
    <Text {...textProps} style={{ display: "contents", ...textProps.style }}>
      {renderTextWithLetters()}
    </Text>
  );
}

FadingLettersFx.displayName = "FadingLettersFx";

export { FadingLettersFx };
export type { FadingLettersFxProps, AnimationState };

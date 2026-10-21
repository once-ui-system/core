import type React from "react";
import styles from "./FadingLetters.module.scss";

export type FadeState = "entering" | "visible" | "exiting";

/**
 * `<TypeFx mode="fade">` (2.x's FadingLettersFx): the words' letters fade in
 * one after another, `charDuration` apart, each word 200ms after the last,
 * from `delay`; `state="exiting"` fades them out in a scatter.
 */
export function fadingLetters(text: string, state: FadeState, delay: number, charDuration: number) {
  const words = text.split(" ");
  return words.map((word, wordIdx) => {
    const letters = word.split("").map((letter, letterIdx) => {
      const entryDelay = delay + wordIdx * 200 + letterIdx * charDuration;
      const exitDelay = Math.random() * 400;
      return (
        <span
          key={`${wordIdx}-${letterIdx}`}
          className={`${styles.letter} ${state === "entering" ? styles.entering : ""} ${
            state === "exiting" ? styles.exiting : ""
          }`}
          style={
            {
              "--entry-delay": `${entryDelay}ms`,
              "--exit-delay": `${exitDelay}ms`,
            } as React.CSSProperties
          }
          data-letter={letter}
          suppressHydrationWarning
        >
          <span className={styles.glyph}>{letter}</span>
        </span>
      );
    });
    return (
      <span key={wordIdx} className={styles.word}>
        {letters}
        {/* Keeps the words apart in the text (copy, search, screen readers).
            Trailing white space in an inline-flex box is not rendered, so the
            gap stays the word's margin. */}
        {wordIdx < words.length - 1 ? " " : null}
      </span>
    );
  });
}

"use client";

import { ComponentProps, forwardRef, ReactNode } from "react";
import styles from "./FadingLettersFx.module.scss";
import { Text } from "./Text";

type AnimationState = "entering" | "visible" | "exiting";

interface FadingLettersFxProps extends ComponentProps<typeof Text> {
  text: string;
  animationState: AnimationState;
  messageIdx?: number;
}

/**
 * The props type `ref` (from `Text`'s), and a plain function component
 * dropped it on React 18, which the peer range allows: it is forwarded to the
 * `Text` now. `forwardRef`'s own props type is `Omit<…, "ref">`, which reduces
 * a props type built on `Text`'s to its index signature and loses `text`, so
 * the component keeps the signature it always had.
 */
interface FadingLettersFxComponent {
  (props: FadingLettersFxProps): ReactNode;
  displayName?: string;
}

const FadingLettersFx = forwardRef<HTMLSpanElement, FadingLettersFxProps>(
  function FadingLettersFx(props, ref) {
    const { text, animationState, messageIdx = 0, ...textProps } = props as FadingLettersFxProps;
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
            {wordLetters}
            {/* Keeps the words apart in the text (copy, search, screen readers).
                Trailing white space in an inline-flex box is not rendered, so the
                gap stays the word's margin. */}
            {wordIdx < words.length - 1 ? " " : null}
          </span>
        );
      });
    };

    return (
      <Text {...textProps} ref={ref} style={{ display: "contents", ...textProps.style }}>
        {renderTextWithLetters()}
      </Text>
    );
  },
) as unknown as FadingLettersFxComponent;

FadingLettersFx.displayName = "FadingLettersFx";

export type { AnimationState, FadingLettersFxProps };
export { FadingLettersFx };

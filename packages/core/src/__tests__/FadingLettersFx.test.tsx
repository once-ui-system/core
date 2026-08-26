import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  FadingLettersFx,
  fadingLettersFxVariants,
  fadingLettersLetterVariants,
  fadingLettersWordVariants,
} from "../components/FadingLettersFx";

describe("FadingLettersFx", () => {
  it("renders text split into words and letters", () => {
    const { container } = render(<FadingLettersFx text="Hello World" animationState="visible" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root.textContent).toBe("HelloWorld");

    const words = root.querySelectorAll(":scope > span");
    expect(words.length).toBe(2);

    const firstWordLetters = words[0].querySelectorAll(":scope > span");
    expect(firstWordLetters.length).toBe(5);
    expect(words[0].textContent).toBe("Hello");

    const secondWordLetters = words[1].querySelectorAll(":scope > span");
    expect(secondWordLetters.length).toBe(5);
    expect(words[1].textContent).toBe("World");
  });

  it("applies entering animation class when animationState is 'entering'", () => {
    const { container } = render(<FadingLettersFx text="Once" animationState="entering" />);
    const root = container.firstElementChild as HTMLElement;
    const letters = root.querySelectorAll(":scope > span > span");

    expect(letters.length).toBe(4);
    for (const letter of letters) {
      expect(letter).toHaveClass("animate-letterFadeIn");
      expect((letter as HTMLElement).style.getPropertyValue("--entry-delay")).toBeTruthy();
    }
  });

  it("applies exiting animation class when animationState is 'exiting'", () => {
    const { container } = render(<FadingLettersFx text="Bye" animationState="exiting" />);
    const root = container.firstElementChild as HTMLElement;
    const letters = root.querySelectorAll(":scope > span > span");

    expect(letters.length).toBe(3);
    for (const letter of letters) {
      expect(letter).toHaveClass("animate-letterFadeOut");
      expect((letter as HTMLElement).style.getPropertyValue("--exit-delay")).toBeTruthy();
    }
  });

  it("does not apply animation classes when animationState is 'visible'", () => {
    const { container } = render(<FadingLettersFx text="Static" animationState="visible" />);
    const root = container.firstElementChild as HTMLElement;
    const letters = root.querySelectorAll(":scope > span > span");

    expect(letters.length).toBe(6);
    for (const letter of letters) {
      expect(letter).not.toHaveClass("animate-letterFadeIn");
      expect(letter).not.toHaveClass("animate-letterFadeOut");
      expect(letter).toHaveClass("inline-block", "will-change-transform");
    }
  });

  it("calculates staggered delays correctly based on messageIdx and letter position", () => {
    const { container } = render(
      <FadingLettersFx text="A B" animationState="entering" messageIdx={1} />,
    );
    const root = container.firstElementChild as HTMLElement;
    const words = root.querySelectorAll(":scope > span");

    // messageIdx = 1 -> base delay = 2500ms
    // word 0, letter 0: 2500 + 0*200 + 0*40 = 2500ms
    const firstLetter = words[0].querySelector("span") as HTMLElement;
    expect(firstLetter.style.getPropertyValue("--entry-delay")).toBe("2500ms");

    // word 1, letter 0: 2500 + 1*200 + 0*40 = 2700ms
    const secondWordFirstLetter = words[1].querySelector("span") as HTMLElement;
    expect(secondWordFirstLetter.style.getPropertyValue("--entry-delay")).toBe("2700ms");
  });

  it("forwards ref to the root HTMLSpanElement", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<FadingLettersFx ref={ref} text="Ref Test" animationState="visible" />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges custom className and style onto root Text component", () => {
    const { container } = render(
      <FadingLettersFx
        text="Styled"
        animationState="visible"
        className="custom-fading-class"
        style={{ color: "rgb(255, 0, 0)" }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-fading-class", "contents");
    expect(root.style.color).toBe("rgb(255, 0, 0)");
    expect(root.style.display).toBe("contents");
  });

  it("passes Text props to underlying Text component", () => {
    const { container } = render(
      <FadingLettersFx text="Heading Text" animationState="visible" variant="heading-strong-l" />,
    );
    const root = container.firstElementChild as HTMLElement;

    // Heading strong L uses font-heading / font-bold / etc.
    expect(root).toBeInTheDocument();
  });

  it("exports CVA variant functions", () => {
    expect(fadingLettersFxVariants()).toBe("contents");
    expect(fadingLettersWordVariants()).toBe("inline-flex mr-[0.35em]");
    expect(fadingLettersLetterVariants({ state: "entering" })).toContain("animate-letterFadeIn");
    expect(fadingLettersLetterVariants({ state: "exiting" })).toContain("animate-letterFadeOut");
    expect(fadingLettersLetterVariants({ state: "visible" })).toBe(
      "inline-block will-change-transform",
    );
  });
});

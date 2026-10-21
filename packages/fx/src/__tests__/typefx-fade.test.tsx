import { LayoutProvider } from "@once-ui-system/core";
import { render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { TypeFx } from "../TypeFx.js";

/** 3.0 F6: 2.x's FadingLettersFx is TypeFx `mode="fade"`, as the codemod writes it. */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe('TypeFx mode="fade" (2.x FadingLettersFx)', () => {
  it("fades each letter in, words 200ms and letters 40ms apart, from delay", () => {
    const { container } = render(<TypeFx mode="fade" words="Hi yo" delay={2500} />, {
      wrapper: wrap,
    });
    const letters = [...container.querySelectorAll<HTMLElement>("[data-letter]")];
    expect(letters.map((l) => l.dataset.letter)).toEqual(["H", "i", "y", "o"]);
    expect(letters.map((l) => l.style.getPropertyValue("--entry-delay"))).toEqual([
      "2500ms",
      "2540ms",
      "2700ms",
      "2740ms",
    ]);
    expect(letters[0].className).toMatch(/entering/);
  });

  it("fades out with state exiting", () => {
    const { container } = render(<TypeFx mode="fade" words="Hi" state="exiting" />, {
      wrapper: wrap,
    });
    expect(container.querySelector("[data-letter]")?.className).toMatch(/exiting/);
  });
});

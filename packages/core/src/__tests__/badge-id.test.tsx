import { fireEvent, render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Tag } from "../components/Tag.js";
import { LayoutProvider } from "../contexts/LayoutProvider.js";

/**
 * 2.x: every Badge without an `id` got `id="badge"`, so two on a page shared
 * it, and each one's arrow followed hover on the first (fixed on 2.x in #197).
 * 3.0 folds Badge into `<Tag variant="announce">`, whose arrow keys off a
 * `data-tag-arrow` of its own and never writes an id.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Tag (2.x Badge) arrow trigger", () => {
  it("gives each announce tag its own trigger, and keeps an id that is passed", () => {
    const { container } = render(
      <>
        <Tag variant="announce" label="One" arrow />
        <Tag variant="announce" label="Two" arrow />
        <Tag variant="announce" label="Three" id="three" />
      </>,
      { wrapper },
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids).not.toContain("badge");
    expect(ids).toContain("three");
    expect(new Set(ids).size).toBe(ids.length);

    const triggers = [...container.querySelectorAll("[data-tag-arrow]")].map((el) =>
      el.getAttribute("data-tag-arrow"),
    );
    expect(triggers).toHaveLength(2);
    expect(new Set(triggers).size).toBe(2);
  });

  it("moves only the hovered tag's arrow", () => {
    const { container } = render(
      <>
        <Tag variant="announce" label="One" arrow />
        <Tag variant="announce" label="Two" arrow />
      </>,
      { wrapper },
    );
    const [first, second] = [...container.querySelectorAll<HTMLElement>("[data-tag-arrow]")];
    const arrowOf = (tag: HTMLElement) => tag.lastElementChild as HTMLElement;
    const [firstBefore, secondBefore] = [arrowOf(first).className, arrowOf(second).className];
    fireEvent.mouseEnter(first);
    expect(arrowOf(first).className).not.toBe(firstBefore);
    expect(arrowOf(second).className).toBe(secondBefore);
  });
});

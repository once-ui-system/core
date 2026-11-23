import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "../components/ProgressBar";
import { LayoutProvider } from "../contexts/LayoutProvider";

/** A thin bar for a row or a card: 2.x and rc.0 drew every track 8px tall. */
describe("ProgressBar size", () => {
  it("draws an 8px track by default and a 4px one at size s", () => {
    const track = (size?: "s" | "m") =>
      render(
        <LayoutProvider>
          <ProgressBar value={40} size={size} showLabel={false} />
        </LayoutProvider>,
      ).container.querySelector('[role="progressbar"]');
    expect((track() as HTMLElement).style.height).toBe("var(--static-space-8)");
    expect((track("m") as HTMLElement).style.height).toBe("var(--static-space-8)");
    expect((track("s") as HTMLElement).style.height).toBe("var(--static-space-4)");
  });
});

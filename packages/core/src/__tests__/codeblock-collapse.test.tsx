import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts";
import { CodeBlock } from "../modules/code";

/**
 * The collapsed state's fade used to blend to `--page-background` while the
 * block paints its own surface, so in dark mode — where the two differ — it
 * laid a band of the wrong colour over the code. It takes the block's own
 * background now.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const long = Array.from({ length: 12 }, (_, i) => `line ${i}`).join("\n");

const collapsed = async (background?: string) => {
  const { container } = render(
    <CodeBlock
      compact
      isCollapsible
      maxLines={3}
      {...(background ? { background: background as never } : {})}
      codes={[{ code: long, language: "tsx", label: "Example" }]}
    />,
    { wrapper: wrap },
  );
  // findByText, not findByRole: jsdom cannot parse the oklch/lab token values
  // the role query resolves through getComputedStyle.
  await screen.findByText("View code");
  return container.querySelector('[class*="mask"]') as HTMLElement;
};

describe("CodeBlock collapse", () => {
  it("fades to the block's own surface, not the page", async () => {
    const fade = await collapsed();
    expect(fade.style.getPropertyValue("--base-color")).toBe("var(--surface-background)");
  });

  it("follows an explicit background", async () => {
    const fade = await collapsed("neutral-alpha-weak");
    expect(fade.style.getPropertyValue("--base-color")).toBe("var(--neutral-alpha-weak)");
  });
});

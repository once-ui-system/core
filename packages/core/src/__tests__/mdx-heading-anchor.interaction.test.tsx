import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { MdxHeadingAnchor } from "../modules/mdx/MdxHeadingAnchor";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * The `/mdx` map's heading anchor is HeadingAnchor under another name: same
 * link, same name, same copy-on-activate.
 */
describe("MdxHeadingAnchor", () => {
  it("renders a named link beside an MDX heading and passes axe", async () => {
    const { container } = render(
      <h2 id="usage">
        Usage <MdxHeadingAnchor id="usage" label="Usage" />
      </h2>,
      { wrapper },
    );
    expect(screen.getByRole("link", { name: "Copy link to Usage" })).toHaveAttribute(
      "href",
      "#usage",
    );
    await expectNoAxeViolations(container);
  });

  it("copies the section URL from the keyboard and confirms", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<MdxHeadingAnchor id="usage" label="Usage" />, { wrapper });
    await user.tab();
    await user.keyboard("{Enter}");
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}${window.location.pathname}#usage`,
    );
    expect(await screen.findByText("Link copied to clipboard.")).toBeInTheDocument();
  });
});

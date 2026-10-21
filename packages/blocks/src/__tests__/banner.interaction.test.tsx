import { Icon, LayoutProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Banner } from "../Banner.js";
import { expectNoAxeViolations } from "../test/axe.js";
import { failOnConsoleError } from "../test/failOnConsoleError.js";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

/**
 * Banner is a full-width strip for a site-wide notice. It adds no role of
 * its own (a notice is not an alert), passes its layout props through, and
 * leaves whatever it holds working.
 */
describe("Banner", () => {
  it("renders its message with minimal props, as a plain strip", async () => {
    const { container } = render(<Banner>Free shipping on orders over $50</Banner>, {
      wrapper: wrap,
    });
    const banner = container.firstElementChild as HTMLElement;
    expect(banner).toHaveTextContent("Free shipping on orders over $50");
    expect(banner).not.toHaveAttribute("role");
    expect(banner).toHaveClass("fill-width");
    await expectNoAxeViolations(container);
  });

  it("passes props through, the caller's winning over its defaults", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Banner ref={ref} radius="s" paddingY="16" role="region" aria-label="Promotion" id="promo">
        <Icon name="check" size="s" /> Claim your free credits.
      </Banner>,
      { wrapper: wrap },
    );
    const banner = screen.getByRole("region", { name: "Promotion" });
    expect(ref.current).toBe(banner);
    expect(banner).toBe(container.firstElementChild);
    expect(banner).toHaveAttribute("id", "promo");
    expect(banner).toHaveClass("radius-s");
    expect(banner).toHaveClass("py-16");
    expect(banner).not.toHaveClass("py-8");
  });

  it("keeps its children interactive and in the tab order", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Banner>
        New release out.
        <a href="/changelog">Read the changelog</a>
        <button type="button" onClick={onClick}>
          Dismiss
        </button>
      </Banner>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Read the changelog" })).toHaveFocus();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);
  });
});

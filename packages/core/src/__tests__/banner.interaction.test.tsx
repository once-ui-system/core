import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Banner } from "../components/Banner";
import { Icon } from "../components/Icon";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

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

  it("adds an underlined call to action after the message", () => {
    render(
      <Banner variant="mesh" link={{ label: "Try it out", href: "/v4" }}>
        v4 is here.
      </Banner>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("link", { name: "Try it out" })).toHaveAttribute("href", "/v4");
  });

  it("hides on dismiss, and remembers it under a dismissKey", async () => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-banner-dismissed");
    const user = userEvent.setup();
    const { container, unmount } = render(<Banner dismissKey="launch-v4">v4 is here.</Banner>, {
      wrapper: wrap,
    });
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(localStorage.getItem("once-ui-banners-dismissed")).toBe("launch-v4");
    expect(document.documentElement.getAttribute("data-banner-dismissed")).toBe("launch-v4");
    expect(container.querySelector("style")?.textContent).toContain(
      'html[data-banner-dismissed~="launch-v4"] [data-banner-key="launch-v4"]',
    );
    unmount();

    // A new page load: the earlier dismissal is picked up again.
    document.documentElement.removeAttribute("data-banner-dismissed");
    render(<Banner dismissKey="launch-v4">v4 is here.</Banner>, { wrapper: wrap });
    expect(document.documentElement.getAttribute("data-banner-dismissed")).toBe("launch-v4");
  });

  it("hides without remembering when only dismissible", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    const { container } = render(<Banner dismissible>Maintenance tonight.</Banner>, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(container.firstElementChild).toHaveStyle({ display: "none" });
    expect(localStorage.getItem("once-ui-banners-dismissed")).toBeNull();
  });
});

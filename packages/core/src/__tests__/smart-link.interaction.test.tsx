import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { SmartLink } from "../components/SmartLink";
import { AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * SmartLink picks the element for its href: the framework Link for an
 * internal path, a new-tab `<a>` for an external URL, a button for an
 * onClick, and never a `javascript:` URL.
 */
describe("SmartLink: element", () => {
  it("renders an internal link and passes axe", async () => {
    const { container } = render(<SmartLink href="/docs">Docs</SmartLink>, { wrapper });
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).not.toHaveAttribute("target");
    await expectNoAxeViolations(container);
  });

  it("opens an external URL in a new tab without the opener", () => {
    render(<SmartLink href="https://once-ui.com">Once UI</SmartLink>, { wrapper });
    const link = screen.getByRole("link", { name: "Once UI" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("routes internal links through the adapter Link", () => {
    const Link = vi.fn(
      ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={href} data-adapter="yes" {...rest}>
          {children}
        </a>
      ),
    );
    render(
      <AdapterProvider adapters={{ Link: Link as never }}>
        <SmartLink href="/docs">Docs</SmartLink>
        <SmartLink href="https://once-ui.com">Site</SmartLink>
      </AdapterProvider>,
      { wrapper },
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("data-adapter", "yes");
    expect(screen.getByRole("link", { name: "Site" })).not.toHaveAttribute("data-adapter");
  });

  it("drops a javascript: href", () => {
    // biome-ignore lint/security/noScriptUrl: the unsafe URL is what this test feeds in.
    render(<SmartLink href="javascript:alert(1)">Bad</SmartLink>, { wrapper });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders a button for an onClick with no href", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SmartLink onClick={onClick}>Act</SmartLink>, { wrapper });
    const button = screen.getByRole("button", { name: "Act" });
    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("renders prefix and suffix icons hidden from assistive tech", () => {
    render(
      <SmartLink href="/docs" prefixIcon="check" suffixIcon="chevronRight">
        Docs
      </SmartLink>,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.querySelectorAll("svg")).toHaveLength(2);
  });

  it("forwards the ref and native anchor attributes", () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <SmartLink ref={ref} href="/docs" aria-current="page" download>
        Docs
      </SmartLink>,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute("aria-current", "page");
  });
});

describe("SmartLink: interaction and style", () => {
  it("is reachable with Tab and follows Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <SmartLink href="/docs" onClick={onClick}>
        Docs
      </SmartLink>,
      { wrapper },
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("underlines a selected link and lets the caller's style win", () => {
    render(
      <SmartLink href="/docs" selected style={{ color: "red" }}>
        Docs
      </SmartLink>,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.style.textDecoration).toBe("underline");
    expect(link.style.color).toBe("red");
  });

  it("strips the underline and spacing when unstyled", () => {
    render(
      <SmartLink href="/docs" unstyled>
        Docs
      </SmartLink>,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.style.textDecoration).toBe("none");
    expect(link).not.toHaveClass("px-2");
  });
});

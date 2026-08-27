import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { ElementType } from "../components/ElementType";
import { Media } from "../components/Media";
import { LayoutProvider } from "../contexts";
import { type AdapterLinkProps, AdapterProvider, useAdapters } from "../contexts/AdapterProvider";

/**
 * Adapter-fallback tests (rfcs/2026-08-once-ui-2-architecture.md §5.3).
 *
 * Rendered with NO provider, components must fall back to standard DOM:
 * plain <a> for internal links, plain lazy <img> for images, and
 * window.location-based navigation state. With an AdapterProvider present,
 * the installed implementations must be used instead (this is how
 * `@once-ui-system/core/next` plugs in next/link, next/image and
 * next/navigation).
 */

const Providers = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("adapter defaults (no provider)", () => {
  it("renders internal links as a plain <a> without new-tab attributes", () => {
    render(
      <ElementType href="/about" data-testid="link">
        About
      </ElementType>,
      { wrapper: Providers },
    );
    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
  });

  it("still renders external links as <a target=_blank>", () => {
    render(
      <ElementType href="https://example.com" data-testid="link">
        External
      </ElementType>,
      { wrapper: Providers },
    );
    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders Media as a plain lazy <img>", () => {
    render(<Media src="/photo.jpg" alt="A photo" />, { wrapper: Providers });
    const img = screen.getByRole("img", { name: "A photo" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/photo.jpg");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("eager-loads Media when priority is set", () => {
    render(<Media src="/hero.jpg" alt="Hero" priority />, { wrapper: Providers });
    expect(screen.getByRole("img", { name: "Hero" })).toHaveAttribute("loading", "eager");
  });

  it("reads the pathname from window.location", () => {
    const ShowPathname = () => {
      const { usePathname } = useAdapters();
      return <span data-testid="pathname">{usePathname()}</span>;
    };
    render(<ShowPathname />);
    expect(screen.getByTestId("pathname")).toHaveTextContent(window.location.pathname);
  });
});

describe("adapter overrides (provider present)", () => {
  it("routes internal links through the installed Link adapter", () => {
    const CustomLink = ({ href, children, ...props }: AdapterLinkProps) => (
      <a href={href} data-custom-link="true" {...props}>
        {children}
      </a>
    );
    render(
      <AdapterProvider adapters={{ Link: CustomLink }}>
        <ElementType href="/docs" data-testid="link">
          Docs
        </ElementType>
      </AdapterProvider>,
      { wrapper: Providers },
    );
    expect(screen.getByTestId("link")).toHaveAttribute("data-custom-link", "true");
  });

  it("keeps DOM defaults for adapters not overridden", () => {
    const CustomLink = ({ href, children, ...props }: AdapterLinkProps) => (
      <a href={href} {...props}>
        {children}
      </a>
    );
    render(
      <AdapterProvider adapters={{ Link: CustomLink }}>
        <Media src="/photo.jpg" alt="Still default" />
      </AdapterProvider>,
      { wrapper: Providers },
    );
    expect(screen.getByRole("img", { name: "Still default" })).toHaveAttribute("loading", "lazy");
  });
});

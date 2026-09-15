import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { LayoutProvider } from "../contexts";
import {
  type AdapterLinkProps,
  AdapterProvider,
  resetAdapterWarning,
} from "../contexts/AdapterProvider";

/**
 * The adapter migration has a silent failure mode: a Next app that keeps the
 * root `LayoutProvider` import renders plain <a> and <img>, losing client-side
 * routing and image optimization with nothing in the console. These cover the
 * warning that closes that gap — including the cases that must stay quiet,
 * which matter more than the one that speaks.
 */

const CustomLink = ({ href, children }: AdapterLinkProps) => <a href={href}>{children}</a>;

let warn: MockInstance<(...args: unknown[]) => void>;

beforeEach(() => {
  resetAdapterWarning();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {}) as unknown as MockInstance<
    (...args: unknown[]) => void
  >;
});

afterEach(() => {
  warn.mockRestore();
  document.head.innerHTML = "";
  delete (window as unknown as Record<string, unknown>).__next_f;
  vi.unstubAllEnvs();
});

/** Stand in for Next's App Router flight stream. */
const pretendNextIsRunning = () => {
  (window as unknown as Record<string, unknown>).__next_f = [];
};

const warned = () => warn.mock.calls.some((c) => String(c[0]).includes("[Once UI]"));

describe("unadapted-framework warning", () => {
  it("warns when Next is detected and no adapters are installed", () => {
    pretendNextIsRunning();
    render(<LayoutProvider>hello</LayoutProvider>);
    expect(warned()).toBe(true);
    expect(String(warn.mock.calls[0][0])).toContain("@once-ui-system/core/next");
  });

  it("stays silent when adapters are installed", () => {
    pretendNextIsRunning();
    render(
      <AdapterProvider adapters={{ Link: CustomLink }}>
        <LayoutProvider>hello</LayoutProvider>
      </AdapterProvider>,
    );
    expect(warned()).toBe(false);
  });

  it("stays silent in a plain React app, where the DOM fallbacks are correct", () => {
    render(<LayoutProvider>hello</LayoutProvider>);
    expect(warned()).toBe(false);
  });

  it("stays silent in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    pretendNextIsRunning();
    render(<LayoutProvider>hello</LayoutProvider>);
    expect(warned()).toBe(false);
  });

  it("warns only once, however many providers mount", () => {
    pretendNextIsRunning();
    render(<LayoutProvider>a</LayoutProvider>);
    render(<LayoutProvider>b</LayoutProvider>);
    render(<LayoutProvider>c</LayoutProvider>);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("[Once UI]")).length).toBe(1);
  });

  it("detects Next from a /_next/ script tag too", () => {
    const s = document.createElement("script");
    s.src = "/_next/static/chunks/main.js";
    document.head.appendChild(s);
    render(<LayoutProvider>hello</LayoutProvider>);
    expect(warned()).toBe(true);
  });
});

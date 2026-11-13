import { render } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const dead = (warn: { mock: { calls: unknown[][] } }) =>
  warn.mock.calls.filter((call) => String(call[0]).includes("nothing can focus or press it"));

/**
 * A Button or IconButton with neither onClick, href nor a button type renders
 * a div, by design: it is decoration inside another control (a clickable
 * Card's "Read more"). Outside one it is a dead control nobody can Tab to.
 * Lighthouse found them on Aveiro's pages (a chat "send" IconButton and a
 * language switcher), so development now says so.
 */
describe("a Button rendered as decoration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("warns in development when no control is around it", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Button>Send</Button>
        <IconButton icon="close" aria-label="Close" />
      </>,
      { wrapper: wrap },
    );
    expect(dead(warn).map((call: unknown[]) => String(call[0]).split(" ")[0])).toEqual([
      "Button",
      "IconButton",
    ]);
  });

  it("stays quiet inside a clickable Card, with a handler, or as a submit", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Card href="/plans" padding="16">
          Plans <Button>Read more</Button>
        </Card>
        <Button onClick={() => {}}>Save</Button>
        <Button type="submit">Send</Button>
        <IconButton icon="close" aria-label="Close" onClick={() => {}} />
      </>,
      { wrapper: wrap },
    );
    expect(dead(warn)).toEqual([]);
  });

  it("stays quiet in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button>Send</Button>, { wrapper: wrap });
    expect(dead(warn)).toEqual([]);
  });

  it("keeps the ref the caller passed", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Button ref={ref as React.Ref<HTMLButtonElement>}>Decoration</Button>, {
      wrapper: wrap,
    });
    expect(ref.current?.tagName).toBe("DIV");
  });
});

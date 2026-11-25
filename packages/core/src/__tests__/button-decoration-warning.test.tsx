import { render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Accordion } from "../components/Accordion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { InsideControl } from "../components/InsideControl";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const nested = (warn: { mock: { calls: unknown[][] } }) =>
  warn.mock.calls.filter((call) => String(call[0]).includes("inside another clickable element"));

/**
 * A Button or IconButton with neither onClick, href nor a button type used to
 * render a div. Outside another control that was a dead control: the
 * agent-operate benchmark read a settings page's "Delete workspace" as text,
 * and so did screen readers. It is now a real `<button type="button">`, and
 * stays a div only inside a control core drew (a clickable Card's
 * "Read more"), where a button would nest in a button.
 */
describe("a Button with nothing wired", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is a real button that agents and assistive tech can find", async () => {
    const { container } = render(
      <>
        <Button variant="secondary">Delete workspace</Button>
        <IconButton icon="close" aria-label="Close" />
      </>,
      { wrapper: wrap },
    );
    for (const name of ["Delete workspace", "Close"]) {
      const button = screen.getByRole("button", { name });
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("type", "button");
    }
    await expectNoAxeViolations(container);
  });

  it("never submits a surrounding form", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Preview</Button>
      </form>,
      { wrapper: wrap },
    );
    screen.getByRole("button", { name: "Preview" }).click();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("stays a plain div inside a clickable Card or an Accordion header", () => {
    render(
      <>
        <Card href="/plans" padding="16">
          Plans <Button>Read more</Button>
        </Card>
        <Card onClick={() => {}} padding="16">
          Workspace <Button>Switch</Button>
        </Card>
        <Accordion title={<Button>Billing</Button>}>Content</Accordion>
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByText("Read more").closest("button, a")).toBe(
      screen.getByRole("link", { name: /Plans/ }),
    );
    expect(screen.getByText("Switch").closest("button")?.textContent).toContain("Workspace");
    expect(screen.getByText("Billing").closest("button")).toBeNull();
    expect(document.querySelector("a button, button button")).toBeNull();
  });

  it("stays a div inside InsideControl, or when aria-hidden", () => {
    render(
      <>
        {/* biome-ignore lint/a11y/useSemanticElements: an app's own control */}
        <div role="button" tabIndex={0}>
          <InsideControl>
            <Button>Top</Button>
          </InsideControl>
        </div>
        {/* biome-ignore lint/a11y/useSemanticElements: an app's own control */}
        <div role="radio" aria-checked="false" aria-label="Blue" tabIndex={0}>
          <IconButton icon="check" aria-hidden />
        </div>
      </>,
      { wrapper: wrap },
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(document.querySelector("button")).toBeNull();
  });

  it("warns in development when it lands inside some other clickable element", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        {/* biome-ignore lint/a11y/useSemanticElements: a hand-made control, the case this warns about */}
        <div role="button" tabIndex={0}>
          Row <Button>Open</Button>
        </div>
        <Button>Alone</Button>
        <Card href="/plans" padding="16">
          Plans <Button>Read more</Button>
        </Card>
      </>,
      { wrapper: wrap },
    );
    expect(nested(warn)).toHaveLength(1);
  });

  it("stays quiet in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      // biome-ignore lint/a11y/useSemanticElements: a hand-made control
      <div role="button" tabIndex={0}>
        <Button>Open</Button>
      </div>,
      { wrapper: wrap },
    );
    expect(nested(warn)).toEqual([]);
  });

  it("keeps the ref the caller passed", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Button ref={ref as React.Ref<HTMLButtonElement>}>Unwired</Button>, {
      wrapper: wrap,
    });
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});

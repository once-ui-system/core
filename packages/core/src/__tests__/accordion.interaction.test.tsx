import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion, type AccordionHandle } from "../components/Accordion";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const header = (name: string) => screen.getByRole("button", { name });
const panelOf = (button: HTMLElement) =>
  document.getElementById(button.getAttribute("aria-controls") as string) as HTMLElement;

/**
 * The header is a `role="button"` disclosure: it toggles on click, Enter and
 * Space, reports `aria-expanded`, and points `aria-controls` at its own panel.
 * A closed panel is hidden from assistive tech and from the Tab order.
 */
describe("Accordion: disclosure", () => {
  it("renders closed with a named, focusable header", async () => {
    const { container } = render(<Accordion title="Shipping">Ships in 2 days</Accordion>, {
      wrapper,
    });
    const button = header("Shipping");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("tabindex", "0");
    expect(panelOf(button)).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it("opens and closes on click", async () => {
    const user = userEvent.setup();
    const { container } = render(<Accordion title="Shipping">Ships in 2 days</Accordion>, {
      wrapper,
    });
    await user.click(header("Shipping"));
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(panelOf(header("Shipping"))).toHaveAttribute("aria-hidden", "false");
    await expectNoAxeViolations(container);
    await user.click(header("Shipping"));
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles with Enter and Space from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Accordion title="Shipping">Ships in 2 days</Accordion>, { wrapper });
    await user.tab();
    expect(header("Shipping")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("a");
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
  });

  it("gives each accordion its own panel id", () => {
    render(
      <>
        <Accordion title="One">First</Accordion>
        <Accordion title="Two">Second</Accordion>
      </>,
      { wrapper },
    );
    const one = panelOf(header("One"));
    const two = panelOf(header("Two"));
    expect(one).not.toBe(two);
    expect(one).toHaveTextContent("First");
    expect(two).toHaveTextContent("Second");
  });

  it("makes a closed panel inert so its fields leave the Tab order", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Filters">
        <input aria-label="Hidden field" />
      </Accordion>,
      { wrapper },
    );
    // user-event's Tab ignores `inert`, so check the attribute the browser acts on.
    const panel = panelOf(header("Filters"));
    expect(panel).toHaveAttribute("inert");

    await user.click(header("Filters"));
    expect(panel).not.toHaveAttribute("inert");
    await user.tab();
    expect(screen.getByLabelText("Hidden field")).toHaveFocus();

    await user.click(header("Filters"));
    expect(panel).toHaveAttribute("inert");
  });

  it("does not fail axe with focusable content in a closed panel", async () => {
    const { container } = render(
      <Accordion title="Filters">
        <a href="#x">Shipping policy</a>
      </Accordion>,
      { wrapper },
    );
    await expectNoAxeViolations(container);
  });
});

describe("Accordion: state", () => {
  it("starts open with `open` and no onToggle, then toggles itself", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Shipping" defaultOpen>
        Ships in 2 days
      </Accordion>,
      { wrapper },
    );
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
    await user.click(header("Shipping"));
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
  });

  it("follows `open` when controlled with onToggle", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <Accordion title="Shipping" open={false} onOpenChange={onToggle}>
        Ships in 2 days
      </Accordion>,
      { wrapper },
    );
    await user.click(header("Shipping"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
    rerender(
      <Accordion title="Shipping" open onOpenChange={onToggle}>
        Ships in 2 days
      </Accordion>,
    );
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
  });

  it("works as a controlled pair with state in the host", async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [open, setOpen] = useState(false);
      return (
        <Accordion title="Shipping" open={open} onOpenChange={() => setOpen((o) => !o)}>
          Ships in 2 days
        </Accordion>
      );
    };
    render(<Host />, { wrapper });
    await user.click(header("Shipping"));
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Enter}");
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
  });

  it("only toggles from the header when toggleOnHeaderClick is on", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Shipping" toggleOnHeaderClick={false}>
        Ships in 2 days
      </Accordion>,
      { wrapper },
    );
    await user.click(header("Shipping"));
    await user.keyboard("{Enter}");
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
  });

  it("calls headerProps handlers first and lets them cancel the toggle", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const onKeyDown = vi.fn();
    render(
      <Accordion title="Shipping" headerProps={{ onClick, onKeyDown }}>
        Ships in 2 days
      </Accordion>,
      { wrapper },
    );
    await user.click(header("Shipping"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Enter}");
    expect(onKeyDown).toHaveBeenCalled();
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
  });

  it("exposes toggle, open and close on the ref", () => {
    let handle: (HTMLDivElement & AccordionHandle) | null = null;
    render(
      <Accordion
        title="Shipping"
        ref={(node) => {
          handle = node as (HTMLDivElement & AccordionHandle) | null;
        }}
      >
        Ships in 2 days
      </Accordion>,
      { wrapper },
    );
    expect(handle).toBe(header("Shipping"));
    act(() => handle?.open());
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
    act(() => handle?.close());
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "false");
    act(() => handle?.toggle());
    expect(header("Shipping")).toHaveAttribute("aria-expanded", "true");
  });

  it("rotates the chevron by iconRotation when open", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Shipping" iconRotation={90}>
        Ships in 2 days
      </Accordion>,
      { wrapper },
    );
    await user.click(header("Shipping"));
    const icon = header("Shipping").querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(icon.style.transform).toBe("rotate(90deg)");
  });
});

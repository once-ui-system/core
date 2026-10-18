import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FocusTrap } from "../components/FocusTrap";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

failOnConsoleError();

const button = (name: string) => screen.getByRole("button", { name });

/** A trap the test turns on and off, with a way in and a way out. */
const Harness = (
  props: Partial<React.ComponentProps<typeof FocusTrap>> & {
    withInitial?: boolean;
    withReturn?: boolean;
    empty?: boolean;
  },
) => {
  const { withInitial, withReturn, empty, ...trapProps } = props;
  const [active, setActive] = useState(false);
  const initial = useRef<HTMLInputElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button type="button" onClick={() => setActive(true)}>
        Open
      </button>
      <button type="button" ref={back}>
        Elsewhere
      </button>
      <FocusTrap
        active={active}
        onEscape={() => setActive(false)}
        initialFocusRef={withInitial ? initial : undefined}
        returnFocusRef={withReturn ? back : undefined}
        {...trapProps}
      >
        {empty ? (
          <p>Nothing to focus</p>
        ) : (
          <>
            <button type="button">First</button>
            <button type="button" disabled>
              Disabled
            </button>
            <input ref={initial} aria-label="Middle" />
            <button type="button" style={{ display: "none" }}>
              Hidden
            </button>
            <button type="button" onClick={() => setActive(false)}>
              Last
            </button>
          </>
        )}
      </FocusTrap>
      <button type="button">After</button>
    </>
  );
};

/**
 * FocusTrap is the focus machinery under Modal and DropdownWrapper: while
 * active it puts focus inside, keeps Tab and Shift+Tab there skipping what
 * Tab cannot reach, runs onEscape, and gives focus back on the way out.
 */
describe("FocusTrap", () => {
  it("does nothing while inactive", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(button("Open")).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(button("First")).toHaveFocus();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(button("After")).toHaveFocus();
  });

  it("moves focus to its first focusable element when activated", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.click(button("Open"));
    expect(button("First")).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("moves focus to initialFocusRef instead when given one", async () => {
    const user = userEvent.setup();
    render(<Harness withInitial />);
    await user.click(button("Open"));
    expect(screen.getByRole("textbox", { name: "Middle" })).toHaveFocus();
  });

  it("focuses itself when there is nothing focusable inside", async () => {
    const user = userEvent.setup();
    render(<Harness empty />);
    await user.click(button("Open"));
    expect(screen.getByText("Nothing to focus").parentElement).toHaveFocus();
  });

  it("leaves focus where it is with autoFocus={false}", async () => {
    const user = userEvent.setup();
    render(<Harness autoFocus={false} />);
    await user.click(button("Open"));
    expect(button("Open")).toHaveFocus();
  });

  it("wraps Tab and Shift+Tab, skipping disabled and hidden elements", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(button("Open"));

    await user.tab();
    expect(screen.getByRole("textbox", { name: "Middle" })).toHaveFocus();
    await user.tab();
    expect(button("Last")).toHaveFocus();
    await user.tab();
    expect(button("First")).toHaveFocus();
    await user.tab({ shift: true });
    expect(button("Last")).toHaveFocus();
  });

  it("runs onEscape and gives focus back to what had it", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(button("Open"));
    await user.keyboard("{Escape}");
    expect(button("Open")).toHaveFocus();
    // Inactive again: Tab walks out.
    await user.tab();
    expect(button("Elsewhere")).toHaveFocus();
  });

  it("ignores an Escape something inside already handled", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(
      <FocusTrap active onEscape={onEscape}>
        <input
          aria-label="Query"
          onKeyDown={(event) => {
            if (event.key === "Escape") event.preventDefault();
          }}
        />
      </FocusTrap>,
    );
    expect(screen.getByRole("textbox", { name: "Query" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("gives focus to returnFocusRef on the way out when given one", async () => {
    const user = userEvent.setup();
    render(<Harness withReturn />);
    await user.click(button("Open"));
    await user.click(button("Last"));
    expect(button("Elsewhere")).toHaveFocus();
  });

  it("leaves focus alone on the way out with restoreFocus={false}", async () => {
    const user = userEvent.setup();
    render(<Harness restoreFocus={false} />);
    await user.click(button("Open"));
    await user.keyboard("{Escape}");
    expect(button("Open")).not.toHaveFocus();
  });

  it("passes className, style and its ref to the container", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FocusTrap active={false} className="trap" style={{ padding: 4 }} ref={ref}>
        <button type="button">Inside</button>
      </FocusTrap>,
    );
    const container = button("Inside").parentElement as HTMLElement;
    expect(container).toHaveClass("trap");
    expect(container.style.padding).toBe("4px");
    // The forwarded ref was accepted and never attached.
    expect(ref.current).toBe(container);
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArrowNavigation, Option } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const list = (props: { autoFocus?: boolean }) => (
  <ArrowNavigation layout="column" itemCount={3} initialFocusedIndex={2} {...props}>
    <Option value="a" label="Alpha" />
    <Option value="b" label="Bravo" />
    <Option value="c" label="Charlie" />
  </ArrowNavigation>
);

/**
 * `useArrowNavigation` focused `initialFocusedIndex` on mount unconditionally.
 * That is fine for a list the user just opened and wrong for a list that
 * merely remounted: a DatePicker swaps its calendar for an ArrowNavigation-less
 * copy while the month selector is open, so closing the selector remounted the
 * calendar and threw focus off the month trigger onto a day button — measured
 * in Chromium, 26ms after the panel closed.
 *
 * The rule these tests pin down: a mount pass takes focus only when the
 * consumer asked for it, or when nothing else holds it.
 *
 * What jsdom does and does not establish here: it runs the effects and the
 * focus calls, which is the whole of the logic under test, so these are real
 * guards and both fail without the change. It says nothing about the ordering
 * against Floating UI's measurement pass or about whether a hidden panel can
 * take focus at all — those are browser facts and were measured separately
 * against apps/dev/src/app/(main)/datepicker-check.
 */
describe("ArrowNavigation mount focus", () => {
  it("leaves focus where it is when the consumer did not ask for it", () => {
    const outside = <Option value="trigger" label="Trigger" />;
    const { getByText, rerender } = render(outside, { wrapper: wrap });
    const trigger = getByText("Trigger").closest('[data-value="trigger"]') as HTMLElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // The list mounting alongside is the DatePicker's shape: the calendar
    // remounts while focus sits on the selector's trigger.
    rerender(
      <>
        {outside}
        {list({})}
      </>,
    );

    expect(document.activeElement).toBe(trigger);
  });

  it("takes focus on mount when autoFocus is set", () => {
    // Index 2, not 0: `autoFocus` only seeds index 0 for a list that has no
    // initial index, so here it means "focus the initial one".
    const { getByText } = render(list({ autoFocus: true }), { wrapper: wrap });
    expect(document.activeElement).toBe(getByText("Charlie").closest('[data-value="c"]'));
  });

  it("takes focus on mount when nothing holds it", () => {
    const { getByText } = render(list({}), { wrapper: wrap });
    expect(document.activeElement).toBe(getByText("Charlie").closest('[data-value="c"]'));
  });
});

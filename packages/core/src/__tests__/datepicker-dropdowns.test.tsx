import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const panel = (id: "month-dropdown" | "year-dropdown") =>
  document.body.querySelector(`[data-dropdown-id="${id}"]`);

/**
 * The month and year selectors were independent toggles. Both triggers call
 * `stopPropagation`, so opening one never reached the other's outside-click
 * handler and the two panels sat open over the calendar at once — the reported
 * "doesn't feel native", since a real select is mutually exclusive.
 *
 * What this test does and does not establish, because the harness is noisier
 * than it looks:
 *
 *  - It fails without the fix and passes with it, so it is a real guard.
 *  - It asserts only the year-then-month direction. Under jsdom the year
 *    trigger opens and the month trigger does not, on identical code paths,
 *    and that is equally true of the component before this change.
 *  - The first click on either trigger is swallowed, again both before and
 *    after. So without the fix this fails on the FIRST assertion rather than
 *    the second, which means part of what makes it pass afterwards is the
 *    extra state update forcing a render, not purely the handler pair.
 *
 * The swallowed first click is a separate, pre-existing fault and is the
 * better explanation of "doesn't feel native" than the double-open is. It is
 * not fixed here and wants its own diagnosis.
 */
describe("DatePicker month/year selectors", () => {
  it("closes the year list when the month selector is clicked", async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <DatePicker value={new Date(2026, 8, 21)} onChange={vi.fn()} />,
      { wrapper: wrap },
    );

    await user.click(getByText("2026"));
    expect(panel("year-dropdown")).not.toBeNull();

    await user.click(getByText("September"));
    expect(panel("year-dropdown")).toBeNull();
  });
});

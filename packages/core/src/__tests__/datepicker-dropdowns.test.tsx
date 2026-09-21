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
 *  - Under jsdom the first click on either trigger appears to be swallowed,
 *    both before and after, so without the fix this fails on the FIRST
 *    assertion rather than the second: part of what makes it pass afterwards
 *    is the extra state update forcing a render, not purely the handler pair.
 *    That swallowed click is a jsdom artifact and not a product fault —
 *    measured in Chromium against apps/dev/.../datepicker-check, the first
 *    real pointer click opens the panel at 63ms and it stays open.
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

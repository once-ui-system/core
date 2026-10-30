import { act, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * A DatePicker with no date showed this month, read from the clock while
 * rendering. A page prerendered on 31 October and opened on 1 November drew
 * October on the server and November in the browser, and hydration failed
 * (React #418). Without a date the calendar now picks the month once mounted.
 */

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function hydrateAcrossMonths(tree: React.ReactElement) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 31, 23, 50));
  const html = renderToString(tree);
  vi.setSystemTime(new Date(2026, 10, 1, 0, 20));

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree, { onRecoverableError: recoverable });
  });
  return { container, errors, recoverable, unmount: () => act(() => root?.unmount()) };
}

describe("DatePicker without a date, prerendered in another month", () => {
  it("hydrates without a mismatch and then shows this month", async () => {
    const { container, errors, recoverable, unmount } = await hydrateAcrossMonths(
      <LayoutProvider>
        <DatePicker />
      </LayoutProvider>,
    );
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    await waitFor(() => expect(container.textContent).toContain("November"));
    unmount();
    container.remove();
  });

  it("does the same for a range", async () => {
    const { container, errors, recoverable, unmount } = await hydrateAcrossMonths(
      <LayoutProvider>
        <DatePicker range months={2} />
      </LayoutProvider>,
    );
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    await waitFor(() => expect(container.textContent).toContain("November"));
    expect(container.textContent).toContain("December");
    unmount();
    container.remove();
  });
});

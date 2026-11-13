import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, type MockInstance, vi } from "vitest";

/**
 * Fails each test in the file that logs a React warning through
 * `console.error` (a missing key, an unknown DOM prop, a nested button).
 *
 * `act(...)` warnings are left out: they come from a component's own
 * animation frame or timer settling after the assertion, which says nothing
 * about the component. The tree is unmounted before the check, so a failure
 * here never leaks one test's DOM into the next.
 *
 * Returns a getter for the spy, for a test that expects an error and
 * silences it.
 */
export function failOnConsoleError(): () => MockInstance {
  let spy: MockInstance;
  beforeEach(() => {
    spy = vi.spyOn(console, "error");
  });
  afterEach(() => {
    cleanup();
    const messages = spy.mock.calls
      .map((args) => args.map(String).join(" "))
      .filter((message) => !message.includes("not wrapped in act("));
    expect(messages).toEqual([]);
  });
  return () => spy;
}

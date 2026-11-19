import { render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { DateInput } from "../components/DateInput";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * DateInput always passed fillWidth={false} to its Dropdown, so in a form the
 * field (one date or a range) sat narrower than the inputs around it, with no
 * prop to stretch it. `fillWidth` now stretches the wrapper and its trigger.
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const parts = (container: HTMLElement) => {
  const wrapper = container.querySelector('[data-role="dropdown-wrapper"]') as HTMLElement;
  const trigger = wrapper.querySelector(".dropdown-trigger") as HTMLElement;
  return { wrapper, trigger };
};

describe("DateInput fillWidth", () => {
  it.each([
    ["one date", <DateInput key="a" id="d" label="Day" />],
    ["a range", <DateInput key="b" id="r" range />],
  ])("keeps %s as wide as its content by default", (_, field) => {
    const { container } = render(field, { wrapper: wrap });
    const { wrapper, trigger } = parts(container);
    expect(wrapper.className).toContain("fit-width");
    expect(trigger.className).toContain("fit-width");
  });

  it.each([
    ["one date", <DateInput key="a" id="d" label="Day" fillWidth />],
    ["a range", <DateInput key="b" id="r" range fillWidth />],
  ])("stretches %s with fillWidth", (_, field) => {
    const { container } = render(field, { wrapper: wrap });
    const { wrapper, trigger } = parts(container);
    expect(wrapper.className).toContain("fill-width");
    expect(wrapper.className).not.toContain("fit-width");
    expect(trigger.className).toContain("fill-width");
    expect(trigger.className).not.toContain("fit-width");
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Option } from "../components/Option";
import { ToggleButton } from "../components/ToggleButton";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `tone` colours the selected state of ToggleButton and Option, the brand-tinted
 * row a sidebar or menu uses for the current item. Neutral stays the default
 * grey, so nothing changes until a tone is asked for.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const el = (ui: React.ReactElement) =>
  render(ui, { wrapper: wrap }).container.firstElementChild as HTMLElement;

describe("selected tone", () => {
  it("ToggleButton keeps the neutral look by default", () => {
    expect(el(<ToggleButton selected>Row</ToggleButton>).className).not.toMatch(/tone-/);
  });

  it("ToggleButton takes a tone", () => {
    expect(
      el(
        <ToggleButton selected tone="brand">
          Row
        </ToggleButton>,
      ).className,
    ).toMatch(/tone-brand/);
  });

  it("Option tints only when selected", () => {
    const row = (selected: boolean) =>
      el(<Option value="a" label="A" tone="brand" selected={selected} />).querySelector(
        "[class*='option']",
      ) as HTMLElement;
    expect(row(true).className).toMatch(/tone-brand/);
    expect(row(false).className).not.toMatch(/tone-brand/);
  });

  it("Option without a tone colours its label neutral", () => {
    const root = el(<Option value="a" label="A" selected />);
    expect(root.querySelector(".neutral-on-background-strong")).not.toBeNull();
  });

  it("Option's label leaves its colour to the tone", () => {
    const root = el(<Option value="a" label="A" tone="brand" selected />);
    expect(root.querySelector(".neutral-on-background-strong")).toBeNull();
  });
});

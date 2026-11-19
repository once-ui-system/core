import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "../components/ColorInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Controlled = ({
  initial = "",
  onValueChange,
  ...props
}: { initial?: string } & Partial<React.ComponentProps<typeof ColorInput>>) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <ColorInput
        id="accent"
        label="Accent"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
        {...props}
      />
      <output>{value}</output>
    </>
  );
};

const field = () => screen.getByLabelText("Accent") as HTMLInputElement;
// jsdom cannot compute the suffix's calc() width, so these queries skip the
// visibility check and the clicks are bare events: see color-input.test.tsx.
const button = (name: string) => screen.queryByRole("button", { name, hidden: true });

/**
 * ColorInput as a user meets it: the field, the opacity button and the clear
 * button in Tab order; a new colour keeps the opacity already picked;
 * clearing hands focus back to the field instead of dropping it on the page
 * when the clear button disappears. (The opacity dropdown itself is out of
 * reach here: jsdom throws computing the suffix's calc() width.)
 */
describe("ColorInput: interaction", () => {
  it("puts the field, then its clear button, in the Tab order", () => {
    render(<Controlled initial="#112233" />, { wrapper: wrap });
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>("input, button, [tabindex]"),
    ).filter((el) => el.tabIndex >= 0 && !el.hasAttribute("disabled"));
    expect(focusables[0]).toBe(field());
    expect(focusables).toContain(button("Remove"));
  });

  it("names the clear and opacity buttons, in the labels it is given", () => {
    render(
      <Controlled
        initial="rgba(17, 34, 51, 0.4)"
        supportAlpha
        labels={{ remove: "Entfernen", adjustOpacity: "Deckkraft anpassen" }}
      />,
      { wrapper: wrap },
    );
    expect(button("Entfernen")).not.toBeNull();
    expect(button("Deckkraft anpassen")).not.toBeNull();
  });

  it("keeps the alpha when a new colour is picked after it", () => {
    const onChange = vi.fn();
    render(<Controlled initial="rgba(0, 0, 255, 0.3)" supportAlpha onValueChange={onChange} />, {
      wrapper: wrap,
    });
    fireEvent.change(field(), { target: { value: "#00ff00" } });
    expect(onChange).toHaveBeenLastCalledWith("rgba(0, 255, 0, 0.3)");
  });

  it("moves focus to the field when the colour is cleared", () => {
    const onChange = vi.fn();
    render(<Controlled initial="#123456" onValueChange={onChange} />, { wrapper: wrap });
    const remove = button("Remove") as HTMLElement;
    remove.focus();
    fireEvent.click(remove);
    expect(onChange).toHaveBeenCalledWith("");
    expect(button("Remove")).toBeNull();
    expect(field()).toHaveFocus();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("restarts at full opacity after a clear", () => {
    const onChange = vi.fn();
    render(<Controlled initial="rgba(10, 20, 30, 0.5)" supportAlpha onValueChange={onChange} />, {
      wrapper: wrap,
    });
    fireEvent.click(button("Remove") as HTMLElement);
    fireEvent.change(field(), { target: { value: "#0a141e" } });
    expect(onChange).toHaveBeenLastCalledWith("rgba(10, 20, 30, 1)");
  });

  it("has no axe violations with supportAlpha and a colour", async () => {
    const { container } = render(<Controlled initial="rgba(10, 20, 30, 0.5)" supportAlpha />, {
      wrapper: wrap,
    });
    await expectNoAxeViolations(container);
  });
});

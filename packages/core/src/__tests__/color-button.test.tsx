import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ColorButton } from "../components/ColorButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const field = () => document.querySelector('input[type="color"]') as HTMLInputElement;
/** A drag in the picker: the native "input" event, which React's onChange is. */
const drag = (value: string) => fireEvent.input(field(), { target: { value } });
/** The picker closing on a new colour: the native "change" event. */
const close = () => field().dispatchEvent(new Event("change", { bubbles: true }));

/**
 * ColorButton: a compact trigger for a custom colour. The button is the
 * control (named by its label and the colour); the native field it opens is
 * out of the Tab order. A drag previews through onValueChange; the picker
 * closing commits once through onValueCommit.
 */
describe("ColorButton", () => {
  it("shows the label and an every-hue swatch before a colour is picked", () => {
    render(<ColorButton label="Own colour" />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "Own colour" })).toBeInTheDocument();
    expect(screen.getByText("Own colour")).toBeInTheDocument();
  });

  it("shows the hex once there is a colour, and names the button with it", () => {
    render(<ColorButton label="Own colour" value="#00b5ba" />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "Own colour: #00B5BA" })).toBeInTheDocument();
    expect(screen.getByText("#00B5BA")).toBeInTheDocument();
  });

  it("keeps the label with showValue={false}", () => {
    render(<ColorButton label="Own colour" value="#00b5ba" showValue={false} />, { wrapper: wrap });
    expect(screen.getByText("Own colour")).toBeInTheDocument();
  });

  it("previews each drag and commits once when the picker closes", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    function Host() {
      const [value, setValue] = useState("#112233");
      return (
        <ColorButton
          label="Own colour"
          value={value}
          onValueChange={onValueChange}
          onValueCommit={(next) => {
            setValue(next);
            onValueCommit(next);
          }}
        />
      );
    }
    render(<Host />, { wrapper: wrap });
    drag("#445566");
    drag("#ff8800");
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenLastCalledWith("#ff8800");
    expect(onValueCommit).not.toHaveBeenCalled();
    // The drag shows on the button before it is committed.
    expect(screen.getByText("#FF8800")).toBeInTheDocument();

    close();
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith("#ff8800");
    expect(screen.getByRole("button", { name: "Own colour: #FF8800" })).toBeInTheDocument();
  });

  it("keeps its own colour when uncontrolled", () => {
    render(<ColorButton label="Own colour" defaultValue="#112233" />, { wrapper: wrap });
    drag("#ff8800");
    close();
    expect(screen.getByRole("button", { name: "Own colour: #FF8800" })).toBeInTheDocument();
  });

  it("opens the native picker from the button, which is the only Tab stop", async () => {
    const user = userEvent.setup();
    render(<ColorButton label="Own colour" />, { wrapper: wrap });
    const picker = vi.fn();
    Object.defineProperty(field(), "showPicker", { value: picker, configurable: true });
    await user.click(screen.getByRole("button", { name: "Own colour" }));
    expect(picker).toHaveBeenCalledTimes(1);
    expect(field().tabIndex).toBe(-1);
    expect(field()).toHaveAttribute("aria-hidden", "true");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<ColorButton label="Own colour" disabled />, { wrapper: wrap });
    const picker = vi.fn();
    Object.defineProperty(field(), "showPicker", { value: picker, configurable: true });
    await user.click(screen.getByRole("button", { name: "Own colour" }));
    expect(picker).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <ColorButton label="Own colour" />
        <ColorButton label="Second colour" value="#00b5ba" aria-describedby="note" />
        <p id="note">Light enough for dark text</p>
      </>,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);
  });
});

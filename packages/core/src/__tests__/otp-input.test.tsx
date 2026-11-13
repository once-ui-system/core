import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { OTPInput } from "../components/OTPInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * OTPInput is one single-digit field per position. Typing a digit fills the
 * field and moves on; anything but a digit is refused; Backspace clears the
 * field, or the one before it when it is already empty; the arrows move
 * between fields; `onComplete` gets the code once every field holds a digit.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const digit = (n: number, of = 4) =>
  screen.getByRole("textbox", { name: `OTP digit ${n} of ${of}` }) as HTMLInputElement;
const values = (of = 4) => Array.from({ length: of }, (_, i) => digit(i + 1, of).value);

describe("OTPInput", () => {
  it("renders one labelled numeric field per digit", () => {
    render(<OTPInput length={6} />, { wrapper });
    for (let n = 1; n <= 6; n++) {
      expect(digit(n, 6)).toHaveAttribute("inputmode", "numeric");
      expect(digit(n, 6)).toHaveAttribute("maxlength", "1");
    }
  });

  it("moves to the next field after each digit and reports the complete code once", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />, { wrapper });

    await user.click(digit(1));
    await user.keyboard("1");
    expect(digit(2)).toHaveFocus();
    await user.keyboard("234");
    expect(values()).toEqual(["1", "2", "3", "4"]);
    expect(digit(4)).toHaveFocus();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("refuses anything but a digit", async () => {
    const user = userEvent.setup();
    render(<OTPInput />, { wrapper });
    await user.click(digit(1));
    await user.keyboard("a- ");
    expect(values()).toEqual(["", "", "", ""]);
    expect(digit(1)).toHaveFocus();
  });

  it("clears the current field on Backspace, then the previous one, moving back", async () => {
    const user = userEvent.setup();
    render(<OTPInput />, { wrapper });
    await user.click(digit(1));
    await user.keyboard("12");
    expect(digit(3)).toHaveFocus();

    // The third field is empty: Backspace clears the second and moves to it.
    await user.keyboard("{Backspace}");
    expect(values()).toEqual(["1", "", "", ""]);
    expect(digit(2)).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(digit(1)).toHaveFocus();
    // The first field holds a digit: Backspace clears it and stays.
    await user.keyboard("{Backspace}");
    expect(values()).toEqual(["", "", "", ""]);
    expect(digit(1)).toHaveFocus();
  });

  it("moves between fields with the arrow keys and stops at both ends", async () => {
    const user = userEvent.setup();
    render(<OTPInput />, { wrapper });
    await user.click(digit(1));
    await user.keyboard("{ArrowLeft}");
    expect(digit(1)).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
    expect(digit(4)).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(digit(3)).toHaveFocus();
  });

  it("focuses the first empty field when the group is clicked", async () => {
    const user = userEvent.setup();
    render(<OTPInput />, { wrapper });
    await user.click(digit(1));
    await user.keyboard("12");
    await user.click(digit(4));
    expect(digit(3)).toHaveFocus();
  });

  it("focuses the first field on mount with autoFocus", () => {
    render(<OTPInput autoFocus />, { wrapper });
    expect(digit(1)).toHaveFocus();
  });

  it("ignores typing when disabled", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput disabled onComplete={onComplete} />, { wrapper });
    await user.click(digit(1));
    await user.keyboard("1234");
    expect(values()).toEqual(["", "", "", ""]);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("shows the error message only with `error`", () => {
    const { rerender } = render(<OTPInput errorMessage="Wrong code" />, { wrapper });
    expect(screen.queryByText("Wrong code")).toBeNull();

    rerender(<OTPInput error errorMessage="Wrong code" />);
    expect(screen.getByText("Wrong code")).toBeInTheDocument();
  });

  it("forwards its ref to the group", () => {
    const ref = createRef<HTMLDivElement>();
    render(<OTPInput ref={ref} />, { wrapper });
    expect(ref.current).toContainElement(digit(1));
  });

  it("has no axe violations", async () => {
    const { container } = render(<OTPInput />, { wrapper });
    await expectNoAxeViolations(container);
  });

  // `disabled` used to stop only the change handler; the fields stayed
  // focusable and were announced as editable.
  it("disables every field", () => {
    render(<OTPInput disabled />, { wrapper });
    for (let n = 1; n <= 4; n++) expect(digit(n)).toBeDisabled();
  });

  // OTPInput renders its error message itself and passes the fields only
  // `error`, but Input set aria-invalid and aria-describedby from
  // `errorMessage` alone. In the error state no field was marked invalid or
  // described by the message, so a screen reader heard nothing wrong.
  it("marks every field invalid and described by the error message", async () => {
    const { container } = render(<OTPInput error errorMessage="Wrong code" />, { wrapper });
    for (let n = 1; n <= 4; n++) {
      expect(digit(n)).toHaveAttribute("aria-invalid", "true");
      expect(digit(n)).toHaveAccessibleDescription("Wrong code");
    }
    await expectNoAxeViolations(container);
  });

  it("marks the fields invalid without a message, and valid without `error`", () => {
    const { rerender } = render(<OTPInput error />, { wrapper });
    expect(digit(1)).toHaveAttribute("aria-invalid", "true");
    expect(digit(1)).not.toHaveAttribute("aria-describedby");

    rerender(<OTPInput />);
    expect(digit(1)).toHaveAttribute("aria-invalid", "false");
    expect(digit(1)).not.toHaveAttribute("aria-describedby");
  });

  // The fields' ids were hard-coded `otp-0`…`otp-N`, so two OTPInputs on one
  // page repeated them, and a label or script that found a field by id got
  // the first group's.
  it("gives two instances distinct field ids", async () => {
    const { container } = render(
      <>
        <OTPInput />
        <OTPInput />
      </>,
      { wrapper },
    );
    const ids = screen.getAllByRole("textbox").map((field) => field.id);
    expect(ids).toHaveLength(8);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    await expectNoAxeViolations(container);
  });

  // The div props were spread onto every digit field after its own handlers,
  // so a caller's handler replaced the field's and typing stopped working,
  // an `id` repeated on each field, and `className` was dropped. (3.0 omits
  // the div's `onChange`, the code arrives through `onValueChange`, so a
  // bubbling `onKeyDown` stands in for the caller's div handler.)
  it("keeps typing working with a caller's div handler, and puts div props on the wrapper", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <OTPInput id="code" className="custom" onKeyDown={onKeyDown} onComplete={onComplete} />,
      { wrapper },
    );

    await user.click(digit(1));
    await user.keyboard("1234");
    expect(values()).toEqual(["1", "2", "3", "4"]);
    expect(onComplete).toHaveBeenCalledWith("1234");
    // Each digit's key still reaches the caller, bubbling up to the wrapper.
    expect(onKeyDown).toHaveBeenCalledTimes(4);

    expect(container.querySelectorAll("#code")).toHaveLength(1);
    expect(container.querySelector("#code")).toHaveClass("custom");
    expect(digit(1).id).not.toBe("code");
  });
});

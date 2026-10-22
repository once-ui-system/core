import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { OTPInput } from "../components/OTPInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const digit = (n: number, of = 4) =>
  screen.getByRole("textbox", { name: `OTP digit ${n} of ${of}` }) as HTMLInputElement;
const code = (of = 4) => Array.from({ length: of }, (_, i) => digit(i + 1, of).value).join("");

/**
 * OTPInput through a whole entry: Tab walks the fields, a code typed in one
 * go lands one digit per field and is reported once complete, a correction
 * after completion reports the corrected code, and a change of `length`
 * keeps every field a controlled one.
 */
describe("OTPInput: interaction", () => {
  it("walks the fields with Tab and Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<OTPInput length={3} />, { wrapper: wrap });
    await user.tab();
    expect(digit(1, 3)).toHaveFocus();
    await user.tab();
    expect(digit(2, 3)).toHaveFocus();
    await user.tab({ shift: true });
    expect(digit(1, 3)).toHaveFocus();
  });

  it("spreads a code typed in one go across the fields and reports it once", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput length={6} onComplete={onComplete} />, { wrapper: wrap });
    await user.click(digit(1, 6));
    await user.keyboard("482913");
    expect(code(6)).toBe("482913");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("482913");
    expect(digit(6, 6)).toHaveFocus();
  });

  it("reports the corrected code after a digit is fixed", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />, { wrapper: wrap });
    await user.click(digit(1));
    await user.keyboard("1234");
    // Back to the second field, clear it, and type over it.
    await user.keyboard("{ArrowLeft}{ArrowLeft}{Backspace}7");
    expect(code()).toBe("1734");
    expect(onComplete.mock.calls).toEqual([["1234"], ["1734"]]);
  });

  // Each field holds one character, so a pasted code kept only its first
  // digit and the rest had to be typed.
  it("fills every field from a code pasted into any of them, and reports it", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput length={6} onComplete={onComplete} />, { wrapper: wrap });
    await user.click(digit(3, 6));
    await user.paste("48 29-13");
    expect(code(6)).toBe("482913");
    expect(onComplete.mock.calls).toEqual([["482913"]]);
    expect(digit(6, 6)).toHaveFocus();
  });

  it("fills from the current field for a paste shorter than the code", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />, { wrapper: wrap });
    await user.click(digit(1));
    await user.keyboard("1");
    expect(digit(2)).toHaveFocus();
    await user.paste("56");
    expect(code()).toBe("156");
    expect(digit(4).value).toBe("");
    expect(digit(4)).toHaveFocus();
    expect(onComplete).not.toHaveBeenCalled();
  });

  // A filled field is at its one-character limit, so a digit typed into it
  // was dropped and the user had to clear it first.
  it("replaces a filled digit typed over, and reports the new code", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />, { wrapper: wrap });
    await user.click(digit(1));
    await user.keyboard("1234");
    await user.keyboard("{ArrowLeft}{ArrowLeft}9");
    expect(code()).toBe("1934");
    expect(digit(3)).toHaveFocus();
    expect(onComplete.mock.calls).toEqual([["1234"], ["1934"]]);
  });

  it("ignores letters, symbols and spaces between digits", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} />, { wrapper: wrap });
    await user.click(digit(1));
    await user.keyboard("1a- 2b3.4");
    expect(code()).toBe("1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("keeps every field controlled when `length` grows", async () => {
    const user = userEvent.setup();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const onComplete = vi.fn();
    const { rerender } = render(<OTPInput length={4} onComplete={onComplete} />, {
      wrapper: wrap,
    });
    rerender(<OTPInput length={6} onComplete={onComplete} />);
    expect(digit(6, 6).value).toBe("");

    await user.click(digit(1, 6));
    await user.keyboard("1234");
    expect(onComplete).not.toHaveBeenCalled();
    await user.keyboard("56");
    expect(onComplete).toHaveBeenCalledWith("123456");
    expect(error).not.toHaveBeenCalled();
  });

  it("drops the digits past a shorter `length`", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const { rerender } = render(<OTPInput length={6} onComplete={onComplete} />, {
      wrapper: wrap,
    });
    await user.click(digit(1, 6));
    await user.keyboard("123");
    rerender(<OTPInput length={4} onComplete={onComplete} />);
    expect(code(4)).toBe("123");
    await user.click(digit(4, 4));
    await user.keyboard("9");
    expect(onComplete).toHaveBeenCalledWith("1239");
  });

  it("is a single group of named fields with no axe violations, with an error", async () => {
    const { container } = render(<OTPInput length={4} error errorMessage="Code expired" />, {
      wrapper: wrap,
    });
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    expect(digit(2)).toHaveAccessibleDescription("Code expired");
    await expectNoAxeViolations(container);
  });

  it("leaves every field out of the Tab order while disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <OTPInput disabled />
        <button type="button">Resend</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Resend" })).toHaveFocus();
  });
});

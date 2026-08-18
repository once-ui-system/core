import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OTPInput } from "../components/OTPInput";

describe("OTPInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the correct number of input fields and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<OTPInput ref={ref} length={4} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(4);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("handles numeric input and calls onComplete when filled", () => {
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[1], { target: { value: "2" } });
    fireEvent.change(inputs[2], { target: { value: "3" } });
    fireEvent.change(inputs[3], { target: { value: "4" } });

    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("rejects non-numeric characters", () => {
    render(<OTPInput length={4} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "a" } });

    expect(inputs[0]).toHaveValue("");
  });

  it("handles backspace navigation", () => {
    render(<OTPInput length={4} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "5" } });
    fireEvent.change(inputs[1], { target: { value: "6" } });

    fireEvent.keyDown(inputs[1], { key: "Backspace" });
    expect(inputs[1]).toHaveValue("");

    fireEvent.keyDown(inputs[1], { key: "Backspace" });
    expect(inputs[0]).toHaveValue("");
  });

  it("handles arrow key navigation", () => {
    render(<OTPInput length={4} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.keyDown(inputs[0], { key: "ArrowRight" });
    fireEvent.keyDown(inputs[1], { key: "ArrowLeft" });
  });

  it("renders error message when error is true", () => {
    render(<OTPInput length={4} error={true} errorMessage="Invalid OTP code" />);

    expect(screen.getByText("Invalid OTP code")).toBeInTheDocument();
  });

  it("does not allow changes when disabled", () => {
    const onComplete = vi.fn();
    render(<OTPInput length={4} disabled={true} onComplete={onComplete} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "9" } });

    expect(inputs[0]).toHaveValue("");
    expect(onComplete).not.toHaveBeenCalled();
  });
});

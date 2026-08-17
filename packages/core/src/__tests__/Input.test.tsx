import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Input } from "../components/Input";

describe("Input", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders input with id, placeholder and forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} id="test-input" placeholder="Enter your name" defaultValue="John" />);

    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "test-input");
    expect(input).toHaveValue("John");
    expect(ref.current).toBe(input);
  });

  it("renders label and manages focus/blur states", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(<Input id="labeled-input" label="Full Name" onFocus={onFocus} onBlur={onBlur} />);

    const label = screen.getByText("Full Name");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "labeled-input");

    const input = screen.getByLabelText("Full Name");
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "Jane" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("renders prefix and suffix elements", () => {
    render(
      <Input
        id="prefix-suffix-input"
        hasPrefix={<span data-testid="prefix-icon">@</span>}
        hasSuffix={<span data-testid="suffix-icon">.com</span>}
      />,
    );

    expect(screen.getByTestId("prefix-icon")).toBeInTheDocument();
    expect(screen.getByTestId("suffix-icon")).toBeInTheDocument();
  });

  it("renders loading spinner when loading is true and hides suffix", () => {
    render(
      <Input
        id="loading-input"
        loading={true}
        hasSuffix={<span data-testid="suffix-icon">.com</span>}
      />,
    );

    expect(screen.queryByTestId("suffix-icon")).not.toBeInTheDocument();
  });

  it("renders character count remaining when characterCount and maxLength are provided", () => {
    render(
      <Input
        id="char-count-input"
        characterCount={true}
        maxLength={20}
        value="Hello"
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("displays errorMessage when error is true", () => {
    render(<Input id="error-input" error={true} errorMessage="This field is required" />);

    expect(screen.getByText("This field is required")).toBeInTheDocument();
    const input = document.getElementById("error-input") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("displays description when provided", () => {
    render(<Input id="desc-input" description="Helper text for input" />);

    expect(screen.getByText("Helper text for input")).toBeInTheDocument();
  });

  it("validates input value with debounce", async () => {
    vi.useFakeTimers();

    const validate = vi.fn((val) => (val === "invalid" ? "Invalid value error" : null));

    const { rerender } = render(
      <Input id="validate-input" validate={validate} value="valid" onChange={() => {}} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Invalid value error")).not.toBeInTheDocument();

    rerender(<Input id="validate-input" validate={validate} value="invalid" onChange={() => {}} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Invalid value error")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("applies ghost variant, custom radius, and size styles", () => {
    const { container } = render(
      <Input
        id="ghost-input"
        variant="ghost"
        height="l"
        radius="top"
        className="custom-input-column"
      />,
    );

    expect(container.firstElementChild).toHaveClass("custom-input-column");
    const row = container.querySelector(".min-h-64");
    expect(row).toBeInTheDocument();
    expect(row).toHaveClass("bg-transparent");
  });
});

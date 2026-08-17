import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Textarea } from "../components/Textarea";

describe("Textarea", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea with id, placeholder and forwards ref", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        ref={ref}
        id="test-textarea"
        placeholder="Type something..."
        defaultValue="Initial text"
      />,
    );

    const textarea = screen.getByPlaceholderText("Type something...");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("id", "test-textarea");
    expect(textarea).toHaveValue("Initial text");
    expect(ref.current).toBe(textarea);
  });

  it("renders label when placeholder is absent and updates floating state on focus/blur", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(
      <Textarea id="labeled-textarea" label="Description" onFocus={onFocus} onBlur={onBlur} />,
    );

    const label = screen.getByText("Description");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "labeled-textarea");

    const textarea = screen.getByLabelText("Description");
    fireEvent.focus(textarea);
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.change(textarea, { target: { value: "Updated content" } });
    fireEvent.blur(textarea);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("renders prefix and suffix elements", () => {
    render(
      <Textarea
        id="prefix-suffix-textarea"
        hasPrefix={<span data-testid="prefix-item">Prefix</span>}
        hasSuffix={<span data-testid="suffix-item">Suffix</span>}
      />,
    );

    expect(screen.getByTestId("prefix-item")).toBeInTheDocument();
    expect(screen.getByTestId("suffix-item")).toBeInTheDocument();
  });

  it("renders character count remaining when characterCount and maxLength are provided", () => {
    render(
      <Textarea
        id="char-count-textarea"
        characterCount={true}
        maxLength={100}
        value="Short note"
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("displays errorMessage when error is true", () => {
    render(<Textarea id="error-textarea" error={true} errorMessage="Content too short" />);

    expect(screen.getByText("Content too short")).toBeInTheDocument();
    const textarea = document.getElementById("error-textarea") as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("displays description when provided", () => {
    render(<Textarea id="desc-textarea" description="Please provide detailed feedback" />);

    expect(screen.getByText("Please provide detailed feedback")).toBeInTheDocument();
  });

  it("validates textarea value with debounce", async () => {
    vi.useFakeTimers();

    const validate = vi.fn((val) => (val === "bad" ? "Invalid input text" : null));

    const { rerender } = render(
      <Textarea id="validate-textarea" validate={validate} value="good" onChange={() => {}} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Invalid input text")).not.toBeInTheDocument();

    rerender(
      <Textarea id="validate-textarea" validate={validate} value="bad" onChange={() => {}} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Invalid input text")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("adjusts height automatically when lines is set to auto", () => {
    const { container } = render(
      <Textarea id="auto-height-textarea" lines="auto" defaultValue="Line 1\nLine 2\nLine 3" />,
    );

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea).toHaveStyle({ resize: "none" });

    fireEvent.change(textarea, { target: { value: "More text" } });
  });

  it("applies ghost variant, custom radius, and size styles", () => {
    const { container } = render(
      <Textarea
        id="ghost-textarea"
        variant="ghost"
        height="l"
        radius="top"
        className="custom-textarea-column"
      />,
    );

    expect(container.firstElementChild).toHaveClass("custom-textarea-column");
    const row = container.querySelector(".min-h-64");
    expect(row).toBeInTheDocument();
    expect(row).toHaveClass("bg-transparent");
  });
});

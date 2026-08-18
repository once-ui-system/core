import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Switch } from "../components/Switch";

describe("Switch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders uncontrolled switch and toggles checked state on click", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} label="Enable notifications" />);

    const hiddenInput = ref.current as HTMLInputElement;
    expect(hiddenInput).not.toBeChecked();

    const visualSwitch = screen.getByRole("switch", { name: "Enable notifications" });
    expect(visualSwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.click(visualSwitch);

    expect(hiddenInput).toBeChecked();
    expect(visualSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("handles controlled isChecked and onToggle", () => {
    const onToggle = vi.fn();
    render(<Switch isChecked={true} onToggle={onToggle} label="Controlled Switch" />);

    const visualSwitch = screen.getByRole("switch", { name: "Controlled Switch" });
    expect(visualSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(visualSwitch);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("handles keyboard Enter and Space keys", () => {
    const onToggle = vi.fn();
    render(<Switch onToggle={onToggle} label="Key test" />);

    const visualSwitch = screen.getByRole("switch", { name: "Key test" });

    fireEvent.keyDown(visualSwitch, { key: "Enter" });
    expect(onToggle).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(visualSwitch, { key: " " });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("does not toggle when disabled", () => {
    const onToggle = vi.fn();
    render(<Switch disabled={true} onToggle={onToggle} label="Disabled Item" />);

    const visualSwitch = screen.getByRole("switch", { name: "Disabled Item" });
    fireEvent.click(visualSwitch);
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.keyDown(visualSwitch, { key: "Enter" });
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("renders description and handles disabled styling", () => {
    render(
      <Switch label="With Description" description="Detailed explanation here" disabled={true} />,
    );

    expect(screen.getByText("With Description")).toBeInTheDocument();
    expect(screen.getByText("Detailed explanation here")).toBeInTheDocument();
  });

  it("renders loading spinner when loading is true", () => {
    render(<Switch label="Loading Switch" loading={true} />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("renders with reverse prop", () => {
    const { container } = render(<Switch label="Reversed Switch" reverse />);

    expect(container.firstChild).toHaveClass("flex-row-reverse");
  });
});

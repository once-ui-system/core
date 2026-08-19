import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Option } from "../components/Option";

describe("Option", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with label and value", () => {
    render(<Option value="opt-1" label="Option 1" />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("data-value", "opt-1");
  });

  it("renders children when label is omitted", () => {
    render(<Option value="child-val">Custom Child Label</Option>);

    expect(screen.getByText("Custom Child Label")).toBeInTheDocument();
  });

  it("renders with description, prefix, and suffix", () => {
    render(
      <Option
        value="detailed-opt"
        label="Main Label"
        description="Helper description"
        hasPrefix={<span data-testid="prefix-icon">Icon</span>}
        hasSuffix={<span data-testid="suffix-badge">Badge</span>}
      />,
    );

    expect(screen.getByText("Main Label")).toBeInTheDocument();
    expect(screen.getByText("Helper description")).toBeInTheDocument();
    expect(screen.getByTestId("prefix-icon")).toBeInTheDocument();
    expect(screen.getByTestId("suffix-badge")).toBeInTheDocument();
  });

  it("calls onClick with option value when clicked", () => {
    const onClick = vi.fn();
    render(<Option value="clickable-opt" label="Click Me" onClick={onClick} />);

    const option = screen.getByRole("option");
    fireEvent.click(option);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("clickable-opt");
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Option value="disabled-opt" label="Disabled Option" disabled onClick={onClick} />);

    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("aria-disabled", "true");
    expect(option).toHaveAttribute("data-disabled", "true");

    fireEvent.click(option);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("triggers onClick on Enter and Space keydown", () => {
    const onClick = vi.fn();
    render(<Option value="key-opt" label="Keyboard Option" onClick={onClick} />);

    const option = screen.getByRole("option");

    fireEvent.keyDown(option, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("key-opt");

    fireEvent.keyDown(option, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not trigger onClick on Enter/Space when disabled", () => {
    const onClick = vi.fn();
    render(<Option value="disabled-key-opt" label="Disabled Option" disabled onClick={onClick} />);

    const option = screen.getByRole("option");
    fireEvent.keyDown(option, { key: "Enter" });
    fireEvent.keyDown(option, { key: " " });

    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders selected state properly", () => {
    const { container } = render(<Option value="selected-opt" label="Selected" selected />);

    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(container.querySelector(".selected")).toBeInTheDocument();
  });

  it("renders danger variant properly", () => {
    const { container } = render(<Option value="danger-opt" label="Delete" danger />);

    expect(container.querySelector(".danger")).toBeInTheDocument();
  });

  it("renders highlighted state via prop", () => {
    const { container } = render(<Option value="high-opt" label="Highlighted" highlighted />);

    expect(container.querySelector(".highlighted")).toBeInTheDocument();
  });

  it("forwards ref to the element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Option ref={ref} value="ref-opt" label="Ref Option" />);

    expect(ref.current).toBe(container.firstChild);
  });

  it("renders as link when href is provided", () => {
    const onLinkClick = vi.fn();
    render(
      <Option value="link-opt" label="Link Option" href="/test-link" onLinkClick={onLinkClick} />,
    );

    const option = screen.getByRole("option");
    expect(option.tagName.toLowerCase()).toBe("a");
    expect(option).toHaveAttribute("href", "/test-link");
  });

  it("clears highlighted class on mouseEnter for sibling options", () => {
    render(
      <div role="listbox">
        <Option value="opt-1" label="Opt 1" />
        <Option value="opt-2" label="Opt 2" />
      </div>,
    );

    const options = screen.getAllByRole("option");
    options[0].classList.add("highlighted");
    options[0].setAttribute("data-highlighted", "true");
    expect(options[0]).toHaveClass("highlighted");

    fireEvent.mouseEnter(options[1]);

    expect(options[0]).not.toHaveClass("highlighted");
    expect(options[0]).not.toHaveAttribute("data-highlighted");
  });
});

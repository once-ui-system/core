import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion, type AccordionHandle } from "../components/Accordion";
import { AccordionGroup } from "../components/AccordionGroup";

describe("Accordion", () => {
  it("renders title, closed by default", () => {
    render(<Accordion title="Test Title">Accordion Content</Accordion>);

    const button = screen.getByRole("button", { name: /Test Title/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveClass("cursor-pointer");
    expect(button).toHaveClass("hover:bg-neutral-alpha-weak");

    const content = screen.getByText("Accordion Content");
    expect(content).toBeInTheDocument();
  });

  it("toggles open and closed on click in uncontrolled mode", () => {
    render(<Accordion title="Toggle Test">Collapsible Content</Accordion>);

    const button = screen.getByRole("button", { name: /Toggle Test/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles on Enter and Space keydown", () => {
    render(<Accordion title="Key Test">Key Content</Accordion>);

    const button = screen.getByRole("button", { name: /Key Test/i });

    fireEvent.keyDown(button, { key: "Enter" });
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(button, { key: " " });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("respects controlled open and onToggle props", () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <Accordion title="Controlled" open={false} onToggle={handleToggle}>
        Controlled Content
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /Controlled/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("aria-expanded", "false"); // unchanged until prop updates

    rerender(
      <Accordion title="Controlled" open={true} onToggle={handleToggle}>
        Controlled Content
      </Accordion>,
    );
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("does not toggle when toggleOnHeaderClick is false", () => {
    render(
      <Accordion title="No Toggle" toggleOnHeaderClick={false}>
        No Toggle Content
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /No Toggle/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("supports imperative handle methods via ref", () => {
    const ref = createRef<HTMLDivElement & AccordionHandle>();
    render(
      <Accordion ref={ref} title="Imperative">
        Handle Content
      </Accordion>,
    );

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.open).toBe("function");
    expect(typeof ref.current?.close).toBe("function");
    expect(typeof ref.current?.toggle).toBe("function");

    const button = screen.getByRole("button", { name: /Imperative/i });

    act(() => {
      ref.current?.open();
    });
    expect(button).toHaveAttribute("aria-expanded", "true");

    act(() => {
      ref.current?.close();
    });
    expect(button).toHaveAttribute("aria-expanded", "false");

    act(() => {
      ref.current?.toggle();
    });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("applies headerProps and contentProps correctly", () => {
    const headerClick = vi.fn();
    const { container } = render(
      <Accordion
        title="Custom Props"
        className="custom-accordion"
        headerProps={{
          className: "custom-header",
          onClick: headerClick,
          tabIndex: 1,
        }}
        contentProps={{
          className: "custom-content",
        }}
      >
        Custom Child
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /Custom Props/i });
    expect(button).toHaveClass("custom-accordion");
    expect(button).toHaveClass("custom-header");
    expect(button).toHaveAttribute("tabindex", "1");

    fireEvent.click(button);
    expect(headerClick).toHaveBeenCalledTimes(1);

    const contentWrapper = container.querySelector(".custom-content");
    expect(contentWrapper).toBeInTheDocument();
  });

  it("works inside AccordionGroup with autoCollapse", () => {
    const items = [
      { title: "Item 1", content: "Content 1" },
      { title: "Item 2", content: "Content 2" },
    ];

    render(<AccordionGroup items={items} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");

    // Clicking the already open accordion closes it
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("returns null when items is empty in AccordionGroup", () => {
    const { container } = render(<AccordionGroup items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("supports autoCollapse={false} allowing multiple accordions open", () => {
    const items = [
      { title: "Item 1", content: "Content 1" },
      { title: "Item 2", content: "Content 2" },
    ];

    render(<AccordionGroup items={items} autoCollapse={false} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
  });

  it("passes custom props and item headerProps in AccordionGroup", () => {
    const headerClick = vi.fn();
    const items = [
      {
        title: "Item 1",
        content: "Content 1",
        headerProps: {
          className: "custom-item-header",
          onClick: headerClick,
        },
      },
    ];

    const { container } = render(
      <AccordionGroup
        items={items}
        radius="l"
        border="brand-alpha-medium"
        className="custom-group"
      />,
    );

    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("custom-group");
    expect(group).toHaveClass("rounded-l");

    const button = screen.getByRole("button", { name: /Item 1/i });
    expect(button).toHaveClass("custom-item-header");

    fireEvent.click(button);
    expect(headerClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});

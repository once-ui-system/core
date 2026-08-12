import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Scroller } from "../components/Scroller";

describe("Scroller", () => {
  it("renders children in row direction by default", () => {
    const { container } = render(
      <Scroller>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Scroller>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();

    const root = container.firstElementChild;
    expect(root).toHaveClass("isolate");

    const scrollTrack = container.querySelector(".overflow-x-auto");
    expect(scrollTrack).toBeInTheDocument();
    expect(scrollTrack).toHaveClass("isolate");
    expect(scrollTrack).toHaveClass("[scrollbar-width:none]");
  });

  it("renders with column direction and merges className", () => {
    const { container } = render(
      <Scroller direction="column" className="custom-scroller">
        <div>Item A</div>
        <div>Item B</div>
      </Scroller>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-scroller");

    const scrollTrack = container.querySelector(".overflow-y-auto");
    expect(scrollTrack).toBeInTheDocument();
  });

  it("forwards ref to root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Scroller ref={ref}>
        <div>Item 1</div>
      </Scroller>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("triggers onItemClick and child onClick when child is clicked", () => {
    const onItemClick = vi.fn();
    const childClick = vi.fn();

    render(
      <Scroller onItemClick={onItemClick}>
        <button type="button" onClick={childClick}>
          Button 0
        </button>
        <button type="button">Button 1</button>
      </Scroller>,
    );

    fireEvent.click(screen.getByText("Button 0"));
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByText("Button 1"));
    expect(onItemClick).toHaveBeenCalledWith(1);
  });

  it("triggers onItemClick and child onClick on Enter and Space keypress", () => {
    const onItemClick = vi.fn();
    const childClick = vi.fn();
    const childKeyDown = vi.fn();

    render(
      <Scroller onItemClick={onItemClick}>
        <button type="button" onClick={childClick} onKeyDown={childKeyDown}>
          Key Item
        </button>
      </Scroller>,
    );

    const item = screen.getByRole("button", { name: "Key Item" });

    fireEvent.keyDown(item, { key: "Enter" });
    expect(childKeyDown).toHaveBeenCalled();
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(0);

    fireEvent.keyDown(item, { key: " " });
    expect(childClick).toHaveBeenCalledTimes(2);
    expect(onItemClick).toHaveBeenCalledTimes(2);
  });

  it("shows scroll buttons and allows scrolling when content overflows", () => {
    const { container } = render(
      <Scroller direction="row">
        <div style={{ minWidth: 500 }}>Wide Item 1</div>
        <div style={{ minWidth: 500 }}>Wide Item 2</div>
      </Scroller>,
    );

    const scrollTrack = container.querySelector(".overflow-x-auto") as HTMLElement;
    expect(scrollTrack).toBeInTheDocument();

    // Mock scroll dimensions
    Object.defineProperty(scrollTrack, "scrollWidth", { value: 1000, configurable: true });
    Object.defineProperty(scrollTrack, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(scrollTrack, "scrollLeft", {
      value: 50,
      writable: true,
      configurable: true,
    });
    scrollTrack.scrollBy = vi.fn();

    // Trigger scroll event
    fireEvent.scroll(scrollTrack);

    const prevButton = screen.getByLabelText("Scroll Previous");
    const nextButton = screen.getByLabelText("Scroll Next");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(scrollTrack.scrollBy).toHaveBeenCalledWith({
      left: 150,
      behavior: "smooth",
    });

    fireEvent.click(prevButton);
    expect(scrollTrack.scrollBy).toHaveBeenCalledWith({
      left: -150,
      behavior: "smooth",
    });

    fireEvent.keyDown(prevButton, { key: "Enter" });
    expect(scrollTrack.scrollBy).toHaveBeenCalledWith({
      left: -150,
      behavior: "smooth",
    });

    fireEvent.keyDown(nextButton, { key: " " });
    expect(scrollTrack.scrollBy).toHaveBeenCalledWith({
      left: 150,
      behavior: "smooth",
    });
  });

  it("handles scroll navigation for column direction", () => {
    const { container } = render(
      <Scroller direction="column">
        <div style={{ minHeight: 500 }}>Tall Item 1</div>
        <div style={{ minHeight: 500 }}>Tall Item 2</div>
      </Scroller>,
    );

    const scrollTrack = container.querySelector(".overflow-y-auto") as HTMLElement;
    expect(scrollTrack).toBeInTheDocument();

    Object.defineProperty(scrollTrack, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(scrollTrack, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(scrollTrack, "scrollTop", {
      value: 100,
      writable: true,
      configurable: true,
    });
    scrollTrack.scrollBy = vi.fn();

    fireEvent.scroll(scrollTrack);

    const prevButton = screen.getByLabelText("Scroll Previous");
    const nextButton = screen.getByLabelText("Scroll Next");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(scrollTrack.scrollBy).toHaveBeenCalledWith({
      top: 200,
      behavior: "smooth",
    });

    fireEvent.click(prevButton);
    expect(scrollTrack.scrollBy).toHaveBeenCalledWith({
      top: -200,
      behavior: "smooth",
    });
  });
});

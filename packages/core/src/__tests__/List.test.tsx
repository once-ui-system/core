import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { List } from "../components/List";
import { ListItem } from "../components/ListItem";

describe("List", () => {
  it("renders ul element by default with list padding and fillWidth classes", () => {
    const { container } = render(
      <List>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>,
    );
    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass("w-full", "m-0", "py-0", "pr-0", "pl-20");

    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(2);
    expect(items[0]).toHaveTextContent("First item");
    expect(items[1]).toHaveTextContent("Second item");
  });

  it("renders ol element when as='ol'", () => {
    const { container } = render(
      <List as="ol">
        <ListItem>Ordered item 1</ListItem>
        <ListItem>Ordered item 2</ListItem>
      </List>,
    );
    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();
    expect(container.querySelector("ul")).not.toBeInTheDocument();
  });

  it("forwards ref to the underlying DOM element", () => {
    const listRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLLIElement>();

    render(
      <List ref={listRef}>
        <ListItem ref={itemRef}>Ref Item</ListItem>
      </List>,
    );

    expect(listRef.current?.tagName).toBe("UL");
    expect(itemRef.current?.tagName).toBe("LI");
  });

  it("merges custom className and preserves style on List and ListItem", () => {
    const { container } = render(
      <List className="custom-list" style={{ maxWidth: 400 }}>
        <ListItem className="custom-item" style={{ color: "blue" }}>
          Styled item
        </ListItem>
      </List>,
    );

    const list = container.querySelector("ul");
    expect(list).toHaveClass("custom-list");
    expect(list?.style.maxWidth).toBe("400px");

    const item = container.querySelector("li");
    expect(item).toHaveClass("custom-item", "marker:text-neutral-on-background-weak", "pl-8");
    expect(item?.style.color).toBe("blue");
  });
});

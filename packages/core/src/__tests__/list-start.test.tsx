import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List } from "../components/List";
import { ListItem } from "../components/ListItem";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `start` is an `ol` attribute that Column's props do not type, so List
 * passes it through to the element itself. These check it reaches the DOM on
 * a numbered list and stays off a bulleted one, where it means nothing.
 */
describe("List start", () => {
  it("numbers an ordered list from `start`", () => {
    const { container } = render(
      <List as="ol" start={3}>
        <ListItem>Third</ListItem>
      </List>,
    );
    const list = container.querySelector("ol");
    expect(list?.getAttribute("start")).toBe("3");
    expect(list?.start).toBe(3);
  });

  it("keeps `start` when an inline style sends the list through the client Flex", () => {
    const { container } = render(
      <LayoutProvider>
        <List as="ol" start={2025} style={{ color: "red" }}>
          <ListItem>Item</ListItem>
        </List>
      </LayoutProvider>,
    );
    expect(container.querySelector("ol")?.getAttribute("start")).toBe("2025");
  });

  it("counts from 1 when no `start` is given", () => {
    const { container } = render(
      <List as="ol">
        <ListItem>First</ListItem>
      </List>,
    );
    expect(container.querySelector("ol")?.hasAttribute("start")).toBe(false);
  });

  it("ignores `start` on an unordered list", () => {
    const { container } = render(
      <List start={3}>
        <ListItem>Item</ListItem>
      </List>,
    );
    expect(container.querySelector("ul")?.hasAttribute("start")).toBe(false);
  });
});

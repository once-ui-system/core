import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileTree, type FileTreeItem } from "../components/FileTree";
import { expectNoAxeViolations } from "../test/axe";

const items: FileTreeItem[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [{ id: "button", name: "Button.tsx", type: "file" }],
      },
      { id: "app", name: "App.tsx", type: "file" },
    ],
  },
  { id: "package", name: "package.json", type: "file" },
];

describe("FileTree", () => {
  it("renders nested folders and files with tree semantics", () => {
    render(<FileTree items={items} defaultExpandedIds={["src", "components"]} />);

    const tree = screen.getByRole("tree", { name: "File tree" });
    expect(
      within(tree)
        .getAllByRole("treeitem")
        .map((node) => node.getAttribute("aria-label")),
    ).toEqual(["src", "components", "Button.tsx", "App.tsx", "package.json"]);
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "true");
  });

  it("has no axe violations for the rendered tree", async () => {
    const { container } = render(<FileTree items={items} defaultExpandedIds={["src"]} />);
    await expectNoAxeViolations(container);
  });

  it("selects rows and toggles folders on pointer click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onItemClick = vi.fn();
    const onExpandedIdsChange = vi.fn();
    render(
      <FileTree
        items={items}
        onSelect={onSelect}
        onItemClick={onItemClick}
        onExpandedIdsChange={onExpandedIdsChange}
      />,
    );

    await user.click(screen.getByRole("treeitem", { name: "src" }));
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "true");
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
    expect(onExpandedIdsChange).toHaveBeenCalledWith(["src"], items[0]);
  });

  it("selects a nested file on click without selecting or collapsing its folder", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FileTree items={items} defaultExpandedIds={["src"]} onSelect={onSelect} />);

    await user.click(screen.getByRole("treeitem", { name: "App.tsx" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("treeitem", { name: "App.tsx" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "true");
  });

  it("supports controlled selection and expansion", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onExpandedIdsChange = vi.fn();
    const { rerender } = render(
      <FileTree
        items={items}
        selectedId="package"
        expandedIds={[]}
        onSelect={onSelect}
        onExpandedIdsChange={onExpandedIdsChange}
      />,
    );

    await user.click(screen.getByRole("treeitem", { name: "src" }));
    expect(screen.getByRole("treeitem", { name: "package.json" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "false");
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(onExpandedIdsChange).toHaveBeenCalledWith(["src"], items[0]);

    rerender(<FileTree items={items} selectedId="src" expandedIds={["src"]} />);
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("treeitem", { name: "App.tsx" })).toBeInTheDocument();
  });

  it("uses a visible controlled selection as the initial keyboard focus row", () => {
    render(<FileTree items={items} selectedId="button" expandedIds={["src", "components"]} />);

    expect(screen.getByRole("treeitem", { name: "Button.tsx" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("tabindex", "-1");
  });

  it("does not expose an empty folder as expandable", async () => {
    const user = userEvent.setup();
    const onExpandedIdsChange = vi.fn();
    render(
      <FileTree
        items={[{ id: "empty", name: "empty", type: "folder", children: [] }]}
        onExpandedIdsChange={onExpandedIdsChange}
      />,
    );
    const emptyFolder = screen.getByRole("treeitem", { name: "empty" });

    expect(emptyFolder).not.toHaveAttribute("aria-expanded");
    await user.click(emptyFolder);
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
  });

  it("moves focus through visible rows and expands and collapses with arrow keys", () => {
    render(<FileTree items={items} defaultExpandedIds={["src"]} />);
    const src = screen.getByRole("treeitem", { name: "src" });

    src.focus();
    fireEvent.keyDown(src, { key: "ArrowDown" });
    const components = screen.getByRole("treeitem", { name: "components" });
    expect(components).toHaveFocus();
    fireEvent.keyDown(components, { key: "ArrowRight" });
    expect(components).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(components, { key: "ArrowRight" });
    const button = screen.getByRole("treeitem", { name: "Button.tsx" });
    expect(button).toHaveFocus();
    fireEvent.keyDown(button, { key: "ArrowLeft" });
    fireEvent.keyDown(components, { key: "ArrowLeft" });
    expect(screen.queryByRole("treeitem", { name: "Button.tsx" })).not.toBeInTheDocument();
  });

  it("selects the focused item with Enter and Space", () => {
    const onSelect = vi.fn();
    render(<FileTree items={items} defaultExpandedIds={["src"]} onSelect={onSelect} />);
    const app = screen.getByRole("treeitem", { name: "App.tsx" });

    act(() => app.focus());
    act(() => fireEvent.keyDown(app, { key: "Enter" }));
    act(() => fireEvent.keyDown(app, { key: " " }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith(
      (items[0] as Extract<FileTreeItem, { type: "folder" }>).children[1],
    );
  });

  it("renders custom item content and empty and loading states", () => {
    const { rerender } = render(
      <FileTree items={items} renderItem={(item) => <strong>{item.name.toUpperCase()}</strong>} />,
    );
    expect(screen.getByText("SRC")).toBeInTheDocument();

    rerender(<FileTree items={[]} emptyState={<span>Nothing here</span>} />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();

    rerender(<FileTree items={items} loading loadingState={<span>Loading tree</span>} />);
    expect(screen.getByText("Loading tree")).toBeInTheDocument();
    expect(screen.queryByRole("treeitem")).not.toBeInTheDocument();
  });
});

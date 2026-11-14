import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ActionCard } from "../modules/chat/ActionCard";
import { useWorkspace } from "../modules/workspace/useWorkspace";
import { WorkspacePanel } from "../modules/workspace/WorkspacePanel";
import {
  emptyWorkspace,
  type WorkspaceState,
  type WorkspaceTabInput,
  workspaceReducer,
  workspaceTabMode,
} from "../modules/workspace/workspace";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type Item = { id: string };
const site = (id: string, editable = true): WorkspaceTabInput<Item> => ({
  key: `site:${id}`,
  title: `Site ${id}`,
  data: { id },
  editable,
});

const open = (state: WorkspaceState<Item>, ...tabs: WorkspaceTabInput<Item>[]) =>
  workspaceReducer(state, { type: "open", tabs });

describe("workspaceReducer", () => {
  it("opens a tab, focuses it and refreshes it on a second open", () => {
    let state = open(emptyWorkspace<Item>(), site("a"));
    expect(state.activeKey).toBe("site:a");
    expect(state.tabs[0].version).toBe(0);
    state = open(state, site("a"));
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].version).toBe(1);
  });

  it("keeps an open editor's version so unsaved edits survive a refresh", () => {
    let state = open(emptyWorkspace<Item>(), site("a"));
    state = workspaceReducer(state, { type: "mode", key: "site:a", mode: "edit" });
    state = open(state, site("a"));
    expect(state.tabs[0].version).toBe(0);
    state = workspaceReducer(state, { type: "mode", key: "site:a", mode: "preview" });
    expect(state.tabs[0].version).toBe(1);
    expect(workspaceTabMode(state, "site:a")).toBe("preview");
  });

  it("refuses edit mode for a tab without an editor", () => {
    let state = open(emptyWorkspace<Item>(), site("a", false));
    state = workspaceReducer(state, { type: "mode", key: "site:a", mode: "edit" });
    expect(workspaceTabMode(state, "site:a")).toBe("preview");
  });

  it("opens in the background without stealing focus", () => {
    let state = open(emptyWorkspace<Item>(), site("a"));
    state = workspaceReducer(state, { type: "open", tabs: [site("b")], focus: false });
    expect(state.activeKey).toBe("site:a");
  });

  it("drops the oldest inactive tab past the cap", () => {
    let state = emptyWorkspace<Item>();
    for (const id of ["a", "b", "c"]) {
      state = workspaceReducer(state, { type: "open", tabs: [site(id)] }, { maxTabs: 2 });
    }
    expect(state.tabs.map((tab) => tab.key)).toEqual(["site:b", "site:c"]);
  });

  it("closing the active tab activates its neighbour and folds when empty", () => {
    let state = open(emptyWorkspace<Item>(), site("a"), site("b"));
    state = workspaceReducer(state, { type: "expand", expanded: true });
    state = workspaceReducer(state, { type: "close", key: "site:b" });
    expect(state.activeKey).toBe("site:a");
    expect(state.expanded).toBe(true);
    state = workspaceReducer(state, { type: "close", key: "site:a" });
    expect(state.activeKey).toBeNull();
    expect(state.expanded).toBe(false);
  });
});

function Harness({ onPreviewRender }: { onPreviewRender?: (mode: string) => void }) {
  const workspace = useWorkspace<Item>({ initialTabs: [site("a"), site("b", false)] });
  return (
    <WorkspacePanel
      workspace={workspace}
      editorHref={(tab) => `/editor/${tab.data.id}`}
      tabIcon={() => "eye"}
    >
      {(tab, mode) => {
        onPreviewRender?.(mode);
        return <p>{`${tab.title} ${mode}`}</p>;
      }}
    </WorkspacePanel>
  );
}

describe("WorkspacePanel", () => {
  it("renders the active tab and switches it to its editor", () => {
    render(<Harness />, { wrapper });
    expect(screen.getByText("Site a preview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Edit" }));
    expect(screen.getByText("Site a edit")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Full editor/ })).toHaveAttribute("href", "/editor/a");
  });

  it("hides the mode switch for a preview-only tab", () => {
    render(<Harness />, { wrapper });
    fireEvent.click(screen.getByRole("tab", { name: "Site b" }));
    expect(screen.getByText("Site b preview")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("moves between tabs with the arrow keys and closes with Delete", () => {
    render(<Harness />, { wrapper });
    const first = screen.getByRole("tab", { name: "Site a" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Site b" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Site b" }), { key: "Delete" });
    expect(screen.queryByRole("tab", { name: "Site b" })).not.toBeInTheDocument();
    expect(screen.getByText("Site a preview")).toBeInTheDocument();
  });

  it("renders nothing, or its empty state, without tabs", () => {
    const { result } = renderHook(() => useWorkspace<Item>());
    const { container, rerender } = render(
      <WorkspacePanel workspace={result.current}>{() => null}</WorkspacePanel>,
      { wrapper },
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <WorkspacePanel workspace={result.current} empty={<p>Nothing open</p>}>
        {() => null}
      </WorkspacePanel>,
    );
    expect(screen.getByText("Nothing open")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Harness />, { wrapper });
    await expectNoAxeViolations(container);
  });
});

describe("useWorkspace", () => {
  it("opens, activates and resets", () => {
    const { result } = renderHook(() => useWorkspace<Item>());
    act(() => result.current.open([site("a"), site("b")]));
    expect(result.current.active?.key).toBe("site:b");
    act(() => result.current.activate("site:a"));
    expect(result.current.active?.key).toBe("site:a");
    act(() => result.current.reset());
    expect(result.current.state.tabs).toHaveLength(0);
  });
});

describe("ActionCard", () => {
  it("shows the title, status and footer and opens a preview", async () => {
    const onPreview = vi.fn();
    const { container } = render(
      <ActionCard
        icon="eye"
        title="Spring menu"
        meta={<span>Draft</span>}
        onPreview={onPreview}
        footer={<button type="button">Schedule</button>}
      >
        <p>Our spring menu starts Tuesday</p>
      </ActionCard>,
      { wrapper },
    );
    expect(screen.getByText("Spring menu")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(onPreview).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Schedule" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

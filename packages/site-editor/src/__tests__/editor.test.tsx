import { sectionSchemas } from "@once-ui-system/blocks";
import { LayoutProvider } from "@once-ui-system/core";
import { act, fireEvent, render as rtlRender, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { createLocalAdapter, type SiteAdapter } from "../adapter.js";
import { FieldForm } from "../components/FieldForm.js";
import { DEFAULT_EDITOR_LABELS } from "../labels.js";
import type { Page, SiteStyle } from "../model.js";
import { SiteEditor, type SiteEditorApi } from "../SiteEditor.js";

const sections = Object.values(sectionSchemas);

const render = (node: ReactNode) => rtlRender(<LayoutProvider>{node}</LayoutProvider>);

const memoryAdapter = (initial: Page) => {
  const store: { page: Page; style: SiteStyle } = {
    page: initial,
    style: { config: { brand: "blue" } },
  };
  const adapter: SiteAdapter = {
    listPages: async () => [{ id: "home", title: "Home", slug: "", home: true }],
    loadPage: async () => store.page,
    savePage: vi.fn(async (_id: string, page: Page) => {
      store.page = page;
    }),
    loadStyle: async () => store.style,
    saveStyle: vi.fn(async (style: SiteStyle) => {
      store.style = style;
    }),
    previewUrl: (id) => `/preview?page=${id}`,
  };
  return { adapter, store };
};

describe("FieldForm", () => {
  it("draws a section's fields from its schema", () => {
    const onChange = vi.fn();
    render(
      <FieldForm
        type="hero"
        fields={sectionSchemas.hero.fields}
        values={{ title: "Hello", layout: "split" }}
        idPrefix="s1"
        onChange={onChange}
      />,
    );
    const title = screen.getByLabelText("Title") as HTMLInputElement;
    expect(title.value).toBe("Hello");
    fireEvent.change(title, { target: { value: "Hi" } });
    expect(onChange).toHaveBeenCalledWith("title", "Hi");
    // The layout is picked by its drawing.
    expect(screen.getByRole("radiogroup", { name: "Layout" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Centered/ }));
    expect(onChange).toHaveBeenCalledWith("layout", "centered");
  });

  it("hides a field whose condition does not hold", () => {
    render(
      <FieldForm
        type="features"
        fields={sectionSchemas.features.fields}
        values={{ layout: "list" }}
        idPrefix="s2"
        onChange={() => {}}
      />,
    );
    expect(screen.queryByText("Columns")).not.toBeInTheDocument();
  });
});

describe("SiteEditor", () => {
  it("adds through the API, undoes, and autosaves", async () => {
    const { adapter, store } = memoryAdapter({ sections: [] });
    const api = createRef<SiteEditorApi>();
    render(<SiteEditor adapter={adapter} sections={sections} apiRef={api} />);
    await waitFor(() => expect(screen.getByText(DEFAULT_EDITOR_LABELS.noSections)).toBeVisible());

    act(() => {
      api.current?.dispatch({
        type: "add",
        section: { id: "h1", type: "hero", props: { title: "Welcome home" } },
      });
    });
    expect(screen.getByText("Welcome home")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Undo/ }));
    expect(screen.queryByText("Welcome home")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Redo/ }));
    expect(screen.getByText("Welcome home")).toBeInTheDocument();

    await act(async () => {
      await api.current?.flush();
    });
    expect(store.page.sections.map((s) => s.id)).toEqual(["h1"]);
  });

  it("opens a section's fields from its tile and goes back with Escape", async () => {
    const { adapter } = memoryAdapter({
      sections: [{ id: "f1", type: "faq", props: { title: "Questions" } }],
    });
    render(<SiteEditor adapter={adapter} sections={sections} />);
    const tile = await screen.findByRole("button", { name: /Questions/ });
    fireEvent.click(tile);
    expect(screen.getByRole("heading", { name: "FAQ" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("heading", { name: "FAQ" })).not.toBeInTheDocument();
  });

  it("removes the selected section with Backspace, and undo brings it back", async () => {
    const { adapter } = memoryAdapter({
      sections: [{ id: "c1", type: "cta", props: { title: "Ready" } }],
    });
    render(<SiteEditor adapter={adapter} sections={sections} />);
    fireEvent.click(await screen.findByRole("button", { name: /Ready/ }));
    fireEvent.keyDown(document.body, { key: "Backspace" });
    expect(screen.queryByText("Ready")).not.toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "z", metaKey: true });
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});

describe("createLocalAdapter", () => {
  it("keeps pages, content and style, and knows what is unpublished", async () => {
    window.localStorage.clear();
    const adapter = createLocalAdapter({ key: "test", previewPath: "/p" });
    expect((await adapter.listPages()).map((p) => p.slug)).toEqual([""]);
    const about = await adapter.createPage?.({ title: "About us", slug: "" });
    expect(about?.slug).toBe("about-us");
    const again = await adapter.createPage?.({ title: "About us", slug: "" });
    expect(again?.slug).toBe("about-us-2");
    await adapter.savePage("home", { sections: [{ id: "x", type: "cta", props: {} }] });
    expect((await adapter.loadPage("home")).sections).toHaveLength(1);
    expect(await adapter.hasUnpublished?.()).toBe(true);
    await adapter.publish?.();
    expect(await adapter.hasUnpublished?.()).toBe(false);
    await adapter.removePage?.("home");
    expect((await adapter.listPages()).some((p) => p.home)).toBe(true);
    expect(adapter.previewUrl("home", "hu")).toBe("/p?page=home&lang=hu");
  });
});

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceSwitcher, type WorkspaceSwitcherItem } from "../components/WorkspaceSwitcher";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items: WorkspaceSwitcherItem[] = [
  { value: "fjell", label: "Fjell", description: "Owner", group: "own" },
  { value: "halden", label: "Halden & Co", description: "Admin", group: "own" },
  {
    value: "ember",
    label: "Ember",
    description: "Platform",
    group: "platform",
    keywords: ["ember-cafe"],
  },
];

const groups = [
  { id: "own", label: "Your workspaces" },
  { id: "platform", label: "Platform access" },
];

const many: WorkspaceSwitcherItem[] = Array.from({ length: 8 }, (_, i) => ({
  value: `w${i}`,
  label: `Workspace ${i}`,
}));

/** Pretends the screen is a phone (every max-width query matches) or not. */
const setPhone = (phone: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: phone && query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
};

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WorkspaceSwitcher", () => {
  it("shows the current item on the trigger", () => {
    setPhone(false);
    render(<WorkspaceSwitcher items={items} value="halden" />, { wrapper });
    expect(screen.getByRole("button", { name: /Halden & Co/ })).toBeInTheDocument();
  });

  it("pins the current item and groups the rest with counts", async () => {
    setPhone(false);
    render(<WorkspaceSwitcher items={items} value="halden" groups={groups} defaultOpen />, {
      wrapper,
    });
    await flush();
    const current = await screen.findByRole("group", { name: "Current · 1" });
    expect(within(current).getByRole("option", { name: /Halden & Co/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const own = screen.getByRole("group", { name: "Your workspaces · 1" });
    expect(within(own).getByRole("option", { name: /Fjell/ })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Platform access · 1" })).toBeInTheDocument();
  });

  it("calls onValueChange with a different item and closes", async () => {
    setPhone(false);
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <WorkspaceSwitcher
        items={items}
        value="fjell"
        onValueChange={onValueChange}
        defaultOpen
        onOpenChange={onOpenChange}
      />,
      { wrapper },
    );
    await flush();
    await user.click(await screen.findByRole("option", { name: /Ember/ }));
    expect(onValueChange).toHaveBeenCalledWith("ember");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("searches above six items, by name and keywords", async () => {
    setPhone(false);
    const user = userEvent.setup();
    const { rerender } = render(<WorkspaceSwitcher items={items} open />, { wrapper });
    await flush();
    expect(screen.queryByRole("textbox", { name: "Search" })).toBeNull();

    rerender(<WorkspaceSwitcher items={[...items, ...many]} open />);
    await flush();
    const search = await screen.findByRole("textbox", { name: "Search" });
    await user.type(search, "ember-c");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.clear(search);
    await user.type(search, "zzz");
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("opens a bottom sheet on a phone, with the create button at its foot", async () => {
    setPhone(true);
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<WorkspaceSwitcher items={items} value="fjell" onCreate={onCreate} />, { wrapper });
    await flush();
    const trigger = screen.getByRole("button", { name: /Fjell/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(trigger);
    const sheet = await screen.findByRole("dialog", { name: "Workspaces" });
    expect(within(sheet).getByRole("listbox", { name: "Workspaces" })).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: "New workspace" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("says when there is nothing to list", async () => {
    setPhone(false);
    render(<WorkspaceSwitcher items={[]} open labels={{ empty: "No venues yet" }} />, { wrapper });
    await flush();
    expect(screen.getByText("No venues yet")).toBeInTheDocument();
  });
});

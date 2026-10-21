import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "../components/Tabs";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type Props = Omit<React.ComponentProps<typeof Tabs>, "children"> & {
  disabled?: string;
  withPanels?: boolean;
  keepMounted?: boolean;
};

/**
 * Shorty's and Stack's settings pages fake this with ToggleButtons and a
 * `useState`: no roles, no arrow keys, every tab in the Tab order, and nothing
 * telling a screen reader which panel belongs to which button.
 */
const Settings = ({ disabled, withPanels = true, keepMounted, ...tabs }: Props) => (
  <Tabs {...tabs}>
    <TabList aria-label="Settings">
      <Tab value="general">General</Tab>
      <Tab value="style" disabled={disabled === "style"}>
        Style
      </Tab>
      <Tab value="security" disabled={disabled === "security"}>
        Security
      </Tab>
    </TabList>
    {withPanels && (
      <>
        <TabPanel value="general" keepMounted={keepMounted}>
          <input aria-label="Name" />
        </TabPanel>
        <TabPanel value="style" keepMounted={keepMounted}>
          Style panel
        </TabPanel>
        <TabPanel value="security" keepMounted={keepMounted}>
          Security panel
        </TabPanel>
      </>
    )}
  </Tabs>
);

const tab = (name: string) => screen.getByRole("tab", { name });
const selectedTab = () => screen.getByRole("tab", { selected: true });

describe("Tabs: structure", () => {
  it("wires tablist, tab and tabpanel roles to each other", () => {
    render(<Settings defaultValue="style" />, { wrapper: wrap });

    const list = screen.getByRole("tablist", { name: "Settings" });
    expect(list).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getAllByRole("tab")).toHaveLength(3);

    const style = tab("Style");
    expect(style).toHaveAttribute("aria-selected", "true");
    expect(tab("General")).toHaveAttribute("aria-selected", "false");

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Style panel");
    expect(style.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(style.id);
    expect(screen.getByRole("tabpanel", { name: "Style" })).toBe(panel);
  });

  it("points every tab at a panel that exists, hidden or not", () => {
    render(<Settings defaultValue="general" />, { wrapper: wrap });
    for (const t of screen.getAllByRole("tab")) {
      const id = t.getAttribute("aria-controls");
      expect(id).toBeTruthy();
      expect(document.getElementById(id as string)).toHaveAttribute("role", "tabpanel");
    }
  });

  it("leaves aria-controls off a tab that has no panel", () => {
    render(<Settings defaultValue="general" withPanels={false} />, { wrapper: wrap });
    for (const t of screen.getAllByRole("tab")) {
      expect(t).not.toHaveAttribute("aria-controls");
    }
  });

  it("keeps an id with a space in the value as one IDREF", () => {
    render(
      <Tabs defaultValue="two words">
        <TabList aria-label="Spaces">
          <Tab value="two words">Two words</Tab>
        </TabList>
        <TabPanel value="two words">Panel</TabPanel>
      </Tabs>,
      { wrapper: wrap },
    );
    const controls = tab("Two words").getAttribute("aria-controls") as string;
    expect(controls).not.toMatch(/\s/);
    expect(document.getElementById(controls)).toHaveTextContent("Panel");
  });

  it("renders the selected panel's content and hides the rest", () => {
    render(<Settings defaultValue="security" />, { wrapper: wrap });
    expect(screen.getByText("Security panel")).toBeVisible();
    expect(screen.queryByText("Style panel")).not.toBeInTheDocument();
    const panels = document.querySelectorAll('[role="tabpanel"]');
    expect(panels).toHaveLength(3);
    expect(Array.from(panels).filter((p) => p.hasAttribute("hidden"))).toHaveLength(2);
  });

  it("keeps an unselected panel's content mounted with keepMounted", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="general" keepMounted />, { wrapper: wrap });
    await user.type(screen.getByLabelText("Name"), "Lorant");
    await user.click(tab("Style"));
    expect(screen.getByText("Style panel")).toBeVisible();
    await user.click(tab("General"));
    expect(screen.getByLabelText("Name")).toHaveValue("Lorant");
  });

  it("throws a readable error outside Tabs", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Tab value="a">A</Tab>, { wrapper: wrap })).toThrow(
      "<Tab> must be rendered inside <Tabs>.",
    );
  });
});

describe("Tabs: selection", () => {
  it("selects the first enabled tab when uncontrolled with no default", () => {
    render(<Settings />, { wrapper: wrap });
    expect(selectedTab()).toBe(tab("General"));
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("General");
  });

  it("selects on click and reports the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Settings defaultValue="general" onValueChange={onChange} />, { wrapper: wrap });

    await user.click(tab("Security"));

    expect(selectedTab()).toBe(tab("Security"));
    expect(screen.getByText("Security panel")).toBeVisible();
    expect(onChange).toHaveBeenCalledExactlyOnceWith("security");
  });

  it("does not report a click on the tab already selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Settings defaultValue="general" onValueChange={onChange} />, { wrapper: wrap });
    await user.click(tab("General"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("follows `value` when controlled, and only `value`", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Settings value="general" onValueChange={onChange} />, {
      wrapper: wrap,
    });

    await user.click(tab("Style"));
    expect(onChange).toHaveBeenCalledWith("style");
    expect(selectedTab()).toBe(tab("General"));

    rerender(<Settings value="style" onValueChange={onChange} />);
    expect(selectedTab()).toBe(tab("Style"));
    expect(screen.getByText("Style panel")).toBeVisible();
  });

  it("works as a controlled pair with state in the host", async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [value, setValue] = useState("general");
      return (
        <>
          <Settings value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    };
    render(<Host />, { wrapper: wrap });
    await user.click(tab("Security"));
    expect(screen.getByRole("status")).toHaveTextContent("security");
    expect(selectedTab()).toBe(tab("Security"));
  });

  it("ignores a click on a disabled tab", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Settings defaultValue="general" disabled="style" onValueChange={onChange} />, {
      wrapper: wrap,
    });
    await user.click(tab("Style"));
    expect(onChange).not.toHaveBeenCalled();
    expect(selectedTab()).toBe(tab("General"));
  });
});

describe("Tabs: keyboard", () => {
  it("puts only the selected tab in the Tab order, then the panel", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="style" />, { wrapper: wrap });

    expect(tab("Style")).toHaveAttribute("tabindex", "0");
    expect(tab("General")).toHaveAttribute("tabindex", "-1");
    expect(tab("Security")).toHaveAttribute("tabindex", "-1");

    await user.tab();
    expect(tab("Style")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("moves and selects with Left and Right, wrapping at both ends", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Settings defaultValue="general" onValueChange={onChange} />, { wrapper: wrap });

    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Style")).toHaveFocus();
    expect(selectedTab()).toBe(tab("Style"));
    expect(tab("Style")).toHaveAttribute("tabindex", "0");
    expect(tab("General")).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(tab("General")).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(tab("Security")).toHaveFocus();
    expect(selectedTab()).toBe(tab("Security"));
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([
      "style",
      "security",
      "general",
      "security",
    ]);
  });

  it("ignores Up and Down when horizontal", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="general" />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowUp}");
    expect(tab("General")).toHaveFocus();
    expect(selectedTab()).toBe(tab("General"));
  });

  it("uses Up and Down when vertical, and ignores Left and Right", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="general" orientation="vertical" />, { wrapper: wrap });
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");

    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("General")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(tab("Style")).toHaveFocus();
    expect(selectedTab()).toBe(tab("Style"));
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(tab("Security")).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="style" />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{End}");
    expect(tab("Security")).toHaveFocus();
    expect(selectedTab()).toBe(tab("Security"));
    await user.keyboard("{Home}");
    expect(tab("General")).toHaveFocus();
    expect(selectedTab()).toBe(tab("General"));
  });

  it("swaps Left and Right in a right-to-left layout", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Settings defaultValue="general" />
      </div>,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(tab("Style")).toHaveFocus();
  });

  it("skips a disabled tab", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="general" disabled="style" />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Security")).toHaveFocus();
  });

  it("only moves focus in manual mode, and selects on Enter or Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Settings defaultValue="general" activation="manual" onValueChange={onChange} />, {
      wrapper: wrap,
    });

    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Style")).toHaveFocus();
    expect(selectedTab()).toBe(tab("General"));
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(selectedTab()).toBe(tab("Style"));

    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");
    expect(selectedTab()).toBe(tab("Security"));
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(["style", "security"]);
  });

  it("keeps the list reachable when `value` matches no tab", () => {
    render(<Settings value="missing" />, { wrapper: wrap });
    expect(screen.queryByRole("tab", { selected: true })).toBeNull();
    expect(tab("General")).toHaveAttribute("tabindex", "0");
  });

  it("keeps the list reachable when the selected tab is disabled", () => {
    render(<Settings value="style" disabled="style" />, { wrapper: wrap });
    expect(tab("General")).toHaveAttribute("tabindex", "0");
    expect(tab("Style")).toHaveAttribute("tabindex", "-1");
  });

  it("leaves arrow keys inside a panel alone", async () => {
    const user = userEvent.setup();
    render(<Settings defaultValue="general" />, { wrapper: wrap });
    await user.click(screen.getByLabelText("Name"));
    await user.keyboard("{ArrowRight}");
    expect(selectedTab()).toBe(tab("General"));
  });
});

describe("Tabs: rendering", () => {
  it("renders the default panel on the server", () => {
    const html = renderToString(
      <LayoutProvider>
        <Settings defaultValue="security" />
      </LayoutProvider>,
    );
    expect(html).toContain("Security panel");
    expect(html).not.toContain("Style panel");
    expect(html).toContain('role="tablist"');
  });

  it("has no axe violations, horizontal or vertical", async () => {
    const { container, rerender } = render(<Settings defaultValue="general" />, {
      wrapper: wrap,
    });
    await expectNoAxeViolations(container);
    rerender(<Settings defaultValue="style" orientation="vertical" disabled="security" />);
    await expectNoAxeViolations(container);
  });
});

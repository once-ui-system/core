import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "../components/Tabs";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * The edges tabs.test.tsx leaves out: a Tabs nested in a panel keeps its own
 * keys, handlers on the parts can veto the built-in behaviour, modifier
 * chords are left to the browser, and refs land on the real elements.
 */
describe("Tabs: nesting", () => {
  const Nested = () => (
    <Tabs defaultValue="outer-a">
      <TabList aria-label="Outer">
        <Tab value="outer-a">Outer A</Tab>
        <Tab value="outer-b">Outer B</Tab>
      </TabList>
      <TabPanel value="outer-a">
        <Tabs defaultValue="inner-a">
          <TabList aria-label="Inner">
            <Tab value="inner-a">Inner A</Tab>
            <Tab value="inner-b">Inner B</Tab>
            <Tab value="inner-c">Inner C</Tab>
          </TabList>
          <TabPanel value="inner-a">Inner A panel</TabPanel>
          <TabPanel value="inner-b">Inner B panel</TabPanel>
          <TabPanel value="inner-c">Inner C panel</TabPanel>
        </Tabs>
      </TabPanel>
      <TabPanel value="outer-b">Outer B panel</TabPanel>
    </Tabs>
  );

  it("moves only within the inner list, and leaves the outer selection alone", async () => {
    const user = userEvent.setup();
    const { container } = render(<Nested />, { wrapper });
    const inner = screen.getByRole("tablist", { name: "Inner" });
    within(inner).getByRole("tab", { name: "Inner A" }).focus();

    await user.keyboard("{ArrowRight}");
    expect(within(inner).getByRole("tab", { name: "Inner B" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(within(inner).getByRole("tab", { name: "Inner C" })).toHaveFocus();
    expect(screen.getByText("Inner C panel")).toBeVisible();
    expect(screen.getByRole("tab", { name: "Outer A" })).toHaveAttribute("aria-selected", "true");
    await expectNoAxeViolations(container);
  });

  it("does not count the inner tabs as outer tabs", async () => {
    const user = userEvent.setup();
    render(<Nested />, { wrapper });
    screen.getByRole("tab", { name: "Outer A" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Outer B" })).toHaveFocus();
    expect(screen.getByText("Outer B panel")).toBeVisible();
  });
});

describe("Tabs: handlers on the parts", () => {
  it("lets a Tab's onClick cancel the selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Tabs defaultValue="a" onChange={onChange}>
        <TabList aria-label="List">
          <Tab value="a">A</Tab>
          <Tab value="b" onClick={onClick}>
            B
          </Tab>
        </TabList>
      </Tabs>,
      { wrapper },
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  });

  it("lets TabList's onKeyDown cancel the arrow keys", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn((e: React.KeyboardEvent) => e.preventDefault());
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="List" onKeyDown={onKeyDown}>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
      </Tabs>,
      { wrapper },
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onKeyDown).toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "A" })).toHaveFocus();
  });

  it("leaves arrow keys with a modifier to the browser", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="List">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
      </Tabs>,
      { wrapper },
    );
    await user.tab();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    await user.keyboard("{Control>}{ArrowRight}{/Control}");
    await user.keyboard("{Meta>}{ArrowRight}{/Meta}");
    expect(screen.getByRole("tab", { name: "A" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Tabs: elements", () => {
  it("forwards refs to the root, the list, a tab and a panel", () => {
    const root = { current: null as HTMLDivElement | null };
    const list = { current: null as HTMLDivElement | null };
    const tab = { current: null as HTMLElement | null };
    const panel = { current: null as HTMLDivElement | null };
    render(
      <Tabs ref={root} defaultValue="a">
        <TabList ref={list} aria-label="List">
          <Tab ref={tab} value="a">
            A
          </Tab>
        </TabList>
        <TabPanel ref={panel} value="a">
          Panel
        </TabPanel>
      </Tabs>,
      { wrapper },
    );
    expect(list.current).toBe(screen.getByRole("tablist"));
    expect(tab.current).toBe(screen.getByRole("tab"));
    expect(panel.current).toBe(screen.getByRole("tabpanel"));
    expect(root.current).toContainElement(list.current);
  });

  it("marks a disabled tab as disabled for assistive tech", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="List">
          <Tab value="a">A</Tab>
          <Tab value="b" disabled>
            B
          </Tab>
        </TabList>
      </Tabs>,
      { wrapper },
    );
    expect(screen.getByRole("tab", { name: "B" })).toBeDisabled();
  });

  it("reaches a control inside the panel after the panel", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="List">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">
          <button type="button">Inside</button>
        </TabPanel>
        <TabPanel value="b">B panel</TabPanel>
      </Tabs>,
      { wrapper },
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Inside" })).toHaveFocus();
  });

  it("passes axe in manual activation with focus on an unselected tab", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tabs defaultValue="a" activation="manual">
        <TabList aria-label="List">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">A panel</TabPanel>
        <TabPanel value="b">B panel</TabPanel>
      </Tabs>,
      { wrapper },
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "false");
    await expectNoAxeViolations(container);
  });
});

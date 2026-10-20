import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Column } from "../components/Column";
import { Option } from "../components/Option";
import { OptionRoleContext } from "../components/OptionRoleContext";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

/** An option has to sit in a listbox to be valid ARIA. */
const List = ({ children }: { children: React.ReactNode }) => (
  <Column role="listbox" aria-label="Choices">
    {children}
  </Column>
);

/**
 * Option is the row every list in the system is made of: Select, Dropdown,
 * ContextMenu, Kbar. It is an `option` named by its label, reports its value
 * on click and on Enter or Space (once, not once per handler), and a disabled
 * one does neither.
 */
describe("Option", () => {
  it("is an option named by its label, with its description", async () => {
    const { container } = render(
      <List>
        <Option value="draft" label="Draft" description="Only you can see it" />
      </List>,
      { wrapper: wrap },
    );
    const option = screen.getByRole("option", { name: /Draft/ });
    expect(option).toHaveAttribute("data-value", "draft");
    expect(option).toHaveTextContent("Only you can see it");
    expect(option).toHaveAttribute("aria-disabled", "false");
    expect(option).not.toHaveAttribute("aria-selected");
    await expectNoAxeViolations(container);
  });

  it("takes its children as the label when there is no label", () => {
    render(
      <List>
        <Option value="x">Child label</Option>
      </List>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("option", { name: "Child label" })).toBeInTheDocument();
  });

  it("renders its prefix and suffix around the label", () => {
    render(
      <List>
        <Option
          value="x"
          label="Middle"
          prefix={<span data-testid="prefix" />}
          suffix={<span data-testid="suffix" />}
        />
      </List>,
      { wrapper: wrap },
    );
    const option = screen.getByRole("option", { name: "Middle" });
    expect(option).toContainElement(screen.getByTestId("prefix"));
    expect(option).toContainElement(screen.getByTestId("suffix"));
  });

  it("reports selected through aria-selected, and lets aria-selected override it", () => {
    render(
      <List>
        <Option value="a" label="Chosen" selected />
        <Option value="b" label="Active" aria-selected />
        <Option value="c" label="Neither" selected={false} />
      </List>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("option", { name: "Chosen" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Active" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Neither" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("puts id on the option element and forwards its ref there", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <List>
        <Option ref={ref} id="opt-1" value="a" label="Alpha" />
      </List>,
      { wrapper: wrap },
    );
    const option = screen.getByRole("option", { name: "Alpha" });
    expect(option).toHaveAttribute("id", "opt-1");
    expect(ref.current).toBe(option);
  });

  it("reports its value on click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <Option value="draft" label="Draft" onClick={onClick} />
      </List>,
      { wrapper: wrap },
    );
    await user.click(screen.getByText("Draft"));
    expect(onClick.mock.calls).toEqual([["draft"]]);
  });

  it("reports its value once each on Enter and on Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <Option value="draft" label="Draft" onClick={onClick} tabIndex={0} />
      </List>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("option", { name: "Draft" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick.mock.calls).toEqual([["draft"], ["draft"]]);
  });

  it("does nothing when disabled, and is out of the tab order", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <List>
        <Option value="draft" label="Draft" onClick={onClick} disabled />
      </List>,
      { wrapper: wrap },
    );
    const option = screen.getByRole("option", { name: "Draft" });
    expect(option).toHaveAttribute("aria-disabled", "true");
    await user.click(option);
    await user.tab();
    expect(option).not.toHaveFocus();
    option.focus();
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("renders a link with href, running onClick and onLinkClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onLinkClick = vi.fn();
    render(
      <List>
        <Option
          value="docs"
          label="Docs"
          href="/docs"
          onClick={onClick}
          onLinkClick={onLinkClick}
        />
      </List>,
      { wrapper: wrap },
    );
    const option = screen.getByRole("option", { name: "Docs" });
    expect(option.tagName).toBe("A");
    expect(option).toHaveAttribute("href", "/docs");
    option.addEventListener("click", (event) => event.preventDefault());
    await user.click(option);
    expect(onClick).toHaveBeenCalledWith("docs");
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it("is a menu item without aria-selected inside a menu", () => {
    render(
      <OptionRoleContext.Provider value="menuitem">
        <Column role="menu" aria-label="Actions">
          <Option value="a" label="Rename" selected />
        </Column>
      </OptionRoleContext.Provider>,
      { wrapper: wrap },
    );
    const item = screen.getByRole("menuitem", { name: "Rename" });
    expect(item).not.toHaveAttribute("aria-selected");
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("is a plain link in a list of links", () => {
    render(
      <OptionRoleContext.Provider value="none">
        <nav>
          <Option value="docs" label="Docs" href="/docs" selected />
        </nav>
      </OptionRoleContext.Provider>,
      { wrapper: wrap },
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).not.toHaveAttribute("aria-selected");
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("shows the highlighted and danger looks when asked", () => {
    render(
      <List>
        <Option value="a" label="Lit" highlighted danger />
      </List>,
      { wrapper: wrap },
    );
    const surface = screen.getByText("Lit").closest('[class*="_option_"]') as HTMLElement;
    expect(surface.className).toMatch(/_highlighted_/);
    expect(surface.className).toMatch(/_danger_/);
  });
});

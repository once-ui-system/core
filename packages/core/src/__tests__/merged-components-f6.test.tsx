import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import * as components from "../components";
import { DateInput } from "../components/DateInput";
import { DatePicker } from "../components/DatePicker";
import { Form } from "../components/Form";
import { Grid } from "../components/Grid";
import { Input } from "../components/Input";
import { Kbd } from "../components/Kbd";
import { Setting } from "../components/Setting";
import { Slider } from "../components/Slider";
import { StatusIndicator } from "../components/StatusIndicator";
import { Table } from "../components/Table";
import { TypeFx } from "../components/TypeFx";
import { LayoutProvider } from "../contexts/LayoutProvider";
import * as modules from "../modules";
import { MegaMenu } from "../modules/navigation/MegaMenu";
import { expectNoAxeViolations } from "../test/axe";

/**
 * 3.0 F6: components folded into a survivor. Each block reaches the old
 * component's look and behaviour through the survivor's new API, as the
 * codemod writes it.
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("the F6 exports are gone", () => {
  it.each([
    "DataTable",
    "DateRangePicker",
    "DateRangeInput",
    "RangeSlider",
    "PasswordInput",
    "KeyTip",
    "MasonryGrid",
    "Pulse",
    "FadingLettersFx",
    "SettingAxes",
    "SettingGroup",
  ])("%s is not exported", (name) => {
    expect(name in components).toBe(false);
  });

  it("MobileMegaMenu is not exported", () => {
    expect("MobileMegaMenu" in modules).toBe(false);
    expect("MegaMenu" in modules).toBe(true);
  });

  it("keeps every survivor", () => {
    for (const name of [
      "Table",
      "DatePicker",
      "DateInput",
      "Slider",
      "Input",
      "Kbd",
      "Grid",
      "StatusIndicator",
      "TypeFx",
      "Setting",
    ]) {
      expect(name in components, name).toBe(true);
    }
  });
});

describe("Table: 2.x data={{ headers, rows }} as columns and array rows", () => {
  // What the codemod writes for 2.x's data: `content` is `header`, rows stay.
  const columns = [
    { header: "Name", key: "name", sortable: true },
    { header: "Status", key: "status" },
  ];
  const rows = [
    ["Bea", <strong key="s">Active</strong>],
    ["Ada", <strong key="s">Invited</strong>],
    ["Cy", <strong key="s">Active</strong>],
  ];
  const names = () =>
    screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[0].textContent);

  it("reads array rows by position, and sorts elements by their text", async () => {
    const user = userEvent.setup();
    const { container } = render(<Table aria-label="Members" columns={columns} rows={rows} />, {
      wrapper: wrap,
    });
    expect(names()).toEqual(["Bea", "Ada", "Cy"]);
    expect(screen.getAllByText("Active")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(names()).toEqual(["Ada", "Bea", "Cy"]);
    await expectNoAxeViolations(container);
  });

  it("searches the cells' text, with 2.x's count and empty message", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Table aria-label="Members" searchable columns={columns} rows={rows} />,
      { wrapper: wrap },
    );
    await user.type(screen.getByRole("textbox", { name: "Search..." }), "invited");
    expect(names()).toEqual(["Ada"]);
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    await expectNoAxeViolations(container);
    await user.type(screen.getByRole("textbox", { name: "Search..." }), "zzz");
    expect(screen.getByText("Try adjusting your search")).toBeInTheDocument();
  });

  it("calls onRowClick and actions with the row and its index", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    const { container } = render(
      <Table
        aria-label="Members"
        columns={columns}
        rows={rows}
        onRowClick={onRowClick}
        rowClassName={(_row, index) => (index === 1 ? "second" : undefined)}
        actions={[
          { icon: "edit", label: "Edit", onClick: onEdit },
          { icon: "close", label: "Remove", onClick: vi.fn(), disabled: (_row, i) => i === 0 },
        ]}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
    await user.click(screen.getByText("Ada"));
    expect(onRowClick).toHaveBeenCalledWith(rows[1], 1);
    expect(screen.getAllByRole("row")[2]).toHaveClass("second");
    await user.click(screen.getAllByRole("button", { name: "Edit" })[2]);
    expect(onEdit).toHaveBeenCalledWith(rows[2], 2);
    // An action's click is its own, not the row's.
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button", { name: "Remove" })[0]).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it("shows loadingState in place of the skeleton rows", () => {
    render(
      <Table
        aria-label="Members"
        loading
        loadingState={<span>Fetching records</span>}
        columns={columns}
        rows={rows}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("Fetching records")).toBeInTheDocument();
  });
});

describe("Table cells a server component sent", () => {
  // Past a few KB of rows, React sends the remaining elements as lazy
  // references, which isValidElement does not recognise: they printed as
  // "[object Object]" (/basics/spacing, every Markdown table).
  it("renders a lazy element in a cell instead of printing it as text", async () => {
    const { lazy, Suspense } = await import("react");
    // React.lazy types its value as a component; resolved to an element, it is a lazy node.
    const load = async () => ({ default: <code>space-16</code> }) as never;
    const cell = lazy(load) as unknown as React.ReactNode;
    render(
      <Suspense fallback={null}>
        <Table columns={[{ key: "token", header: "Token" }]} rows={[{ token: cell }]} />
      </Suspense>,
      { wrapper: wrap },
    );
    expect(await screen.findByText("space-16")).toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).toBeNull();
  });
});

describe("DatePicker range and DateInput range (2.x DateRangePicker, DateRangeInput)", () => {
  it("picks a range over two months with months={2}", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        range
        months={2}
        defaultValue={{ startDate: new Date(2026, 0, 10), endDate: undefined }}
        onValueChange={onValueChange}
      />,
      { wrapper: wrap },
    );
    await waitFor(() => expect(container.querySelectorAll('[role="grid"]')).toHaveLength(2));
    const february3 = await waitFor(() => {
      const button = container.querySelector<HTMLButtonElement>(
        `button[data-value="${new Date(2026, 1, 3).toISOString()}"]`,
      );
      if (!button) throw new Error("no day");
      return button;
    });
    await user.click(february3);
    expect(onValueChange).toHaveBeenLastCalledWith({
      startDate: new Date(2026, 0, 10),
      endDate: new Date(2026, 1, 3),
    });
    await expectNoAxeViolations(container);
  });

  it("DateInput range draws two comboboxes with their labels", async () => {
    const { container } = render(
      <DateInput range id="stay" startLabel="Check-in" endLabel="Check-out" />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("combobox", { name: "Check-in" })).toHaveAttribute("id", "stay-start");
    expect(screen.getByRole("combobox", { name: "Check-out" })).toHaveAttribute("id", "stay-end");
    await expectNoAxeViolations(container);
  });
});

describe("Slider range (2.x RangeSlider), error and size", () => {
  it("draws two thumbs in a named group", async () => {
    const { container } = render(<Slider range label="Price" defaultValue={[20, 80]} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(screen.getAllByRole("slider").map((s) => s.getAttribute("aria-valuenow"))).toEqual([
      "20",
      "80",
    ]);
    await expectNoAxeViolations(container);
  });

  it("marks either mode invalid and describes it by errorMessage", async () => {
    const { container } = render(
      <>
        <Slider label="Volume" errorMessage="Too loud" defaultValue={90} />
        <Slider range label="Price" errorMessage="Pick a narrower range" />
      </>,
      { wrapper: wrap },
    );
    const single = screen.getByRole("slider", { name: "Volume" });
    expect(single).toHaveAttribute("aria-invalid", "true");
    expect(single).toHaveAccessibleDescription("Too loud");
    for (const thumb of screen.getAllByRole("slider", { name: /Minimum|Maximum/ })) {
      expect(thumb).toHaveAttribute("aria-invalid", "true");
      expect(thumb).toHaveAccessibleDescription("Pick a narrower range");
    }
    await expectNoAxeViolations(container);
  });

  it("takes its size from a Form, and its own size over it", () => {
    const { container } = render(
      <Form size="l">
        <Slider aria-label="A" />
        <Slider aria-label="B" size="s" />
        <Slider range aria-label="C" />
      </Form>,
      { wrapper: wrap },
    );
    const roots = container.querySelectorAll("[class*='container']");
    expect(roots[0].className).toMatch(/\bl\b|_l_|l_/);
    expect(roots[1].className).toMatch(/\bs\b|_s_|s_/);
    expect(roots[2].className).toMatch(/\bl\b|_l_|l_/);
  });

  it("draws the 2.x look at m, with no size class", () => {
    const { container } = render(<Slider aria-label="A" />, { wrapper: wrap });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/(^|\s|_)(xs|s|l|xl)(_|\s|$)/);
  });
});

describe('Input type="password" (2.x PasswordInput)', () => {
  it("shows and hides the text with the eye button", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input id="pw" label="Password" type="password" />, {
      wrapper: wrap,
    });
    const field = screen.getByLabelText("Password");
    expect(field).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(field).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(field).toHaveAttribute("type", "password");
    await expectNoAxeViolations(container);
  });

  it("is a plain password field with reveal={false}", () => {
    render(<Input id="pw" label="Password" type="password" reveal={false} />, { wrapper: wrap });
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("Kbd keys (2.x KeyTip)", () => {
  it("draws caps for keys after the action, spoken in full", async () => {
    const { container } = render(<Kbd keys="mod+z" label="Undo" />, { wrapper: wrap });
    const root = container.querySelector("[data-keytip]") as HTMLElement;
    expect(root).toHaveTextContent(/Undo/);
    expect(root.querySelectorAll("kbd").length).toBe(2);
    expect(root).toHaveTextContent(/Control\+Z|Command\+Z/);
    await expectNoAxeViolations(container);
  });

  it("is still one cap without keys, label or children as its text", () => {
    const { container } = render(
      <>
        <Kbd>Esc</Kbd>
        <Kbd label="Tab" />
      </>,
      { wrapper: wrap },
    );
    const caps = container.querySelectorAll("kbd");
    expect([...caps].map((cap) => cap.textContent)).toEqual(["Esc", "Tab"]);
  });
});

describe("Grid masonry (2.x MasonryGrid)", () => {
  it("flows its children down CSS columns, each kept whole", () => {
    const { container } = render(
      <Grid masonry columns={4} s={{ columns: 1 }}>
        <div>a</div>
        <div>b</div>
      </Grid>,
      { wrapper: wrap },
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/columns-4/);
    expect(root.className).toMatch(/s-columns-1/);
    expect(root.style.display).toBe("block");
    expect(root.children).toHaveLength(2);
    expect((root.children[0] as HTMLElement).style.breakInside).toBe("avoid");
  });
});

describe("StatusIndicator pulse (2.x Pulse)", () => {
  it("draws the ring and dot in tone, decorative unless named", async () => {
    const { container, rerender } = render(<StatusIndicator pulse tone="danger" size="s" />, {
      wrapper: wrap,
    });
    expect(container.querySelector(".danger-solid-strong")).not.toBeNull();
    expect(container.querySelector(".danger-solid-medium")).not.toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
    await expectNoAxeViolations(container);
    rerender(<StatusIndicator pulse aria-label="Live" />);
    expect(screen.getByRole("img", { name: "Live" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("keeps the plain dot without pulse", () => {
    render(<StatusIndicator scheme="green" />, { wrapper: wrap });
    expect(screen.getByRole("img", { name: "green status indicator" })).toBeInTheDocument();
  });
});

describe('TypeFx mode="fade" (2.x FadingLettersFx)', () => {
  it("fades each letter in, words 200ms and letters 40ms apart, from delay", () => {
    const { container } = render(<TypeFx mode="fade" words="Hi yo" delay={2500} />, {
      wrapper: wrap,
    });
    const letters = [...container.querySelectorAll<HTMLElement>("[data-letter]")];
    expect(letters.map((l) => l.dataset.letter)).toEqual(["H", "i", "y", "o"]);
    expect(letters.map((l) => l.style.getPropertyValue("--entry-delay"))).toEqual([
      "2500ms",
      "2540ms",
      "2700ms",
      "2740ms",
    ]);
    expect(letters[0].className).toMatch(/entering/);
  });

  it("fades out with state exiting", () => {
    const { container } = render(<TypeFx mode="fade" words="Hi" state="exiting" />, {
      wrapper: wrap,
    });
    expect(container.querySelector("[data-letter]")?.className).toMatch(/exiting/);
  });
});

describe("Setting axes and group (2.x SettingAxes, SettingGroup)", () => {
  it("axes draws one row per property with an axis each", async () => {
    const { container } = render(
      <Setting
        label="Tilt"
        axes={[
          { label: "X", control: <input aria-label="Tilt X" /> },
          { label: "Y", control: <input aria-label="Tilt Y" /> },
        ]}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tilt Y" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("control and open make a group whose children show while open", () => {
    const { rerender } = render(
      <Setting label="Sync" control={<span>toggle</span>} open={false}>
        <span>inner</span>
      </Setting>,
      { wrapper: wrap },
    );
    expect(screen.getByText("toggle")).toBeInTheDocument();
    expect(screen.queryByText("inner")).toBeNull();
    rerender(
      <Setting label="Sync" control={<span>toggle</span>} open>
        <span>inner</span>
      </Setting>,
    );
    expect(screen.getByText("inner")).toBeInTheDocument();
  });

  it("without either, the children are the row's control", () => {
    render(
      <Setting label="Theme">
        <span>control</span>
      </Setting>,
      { wrapper: wrap },
    );
    expect(screen.getByText("control")).toBeInTheDocument();
  });
});

describe("MegaMenu collapseBelow (2.x MobileMegaMenu)", () => {
  const groups = [
    { id: "docs", label: "Docs", sections: [{ links: [{ label: "Start", href: "/start" }] }] },
    { id: "blog", label: "Blog", href: "/blog" },
  ];

  it('"always" renders the accordions alone', async () => {
    const { container } = render(<MegaMenu collapseBelow="always" menuGroups={groups} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(container.querySelectorAll(".flex-hide")).toHaveLength(0);
    await expectNoAxeViolations(container);
  });

  it("a breakpoint renders both, each hidden on its side of it", () => {
    const { container } = render(<MegaMenu collapseBelow="m" menuGroups={groups} />, {
      wrapper: wrap,
    });
    const [bar, accordion] = [...container.children] as HTMLElement[];
    expect(bar.className).toMatch(/m-flex-hide/);
    expect(accordion.className).toMatch(/flex-hide/);
    expect(accordion.className).toMatch(/m-flex-show/);
  });

  it("a click on a collapsed link calls onClose", async () => {
    const onClose = vi.fn();
    render(<MegaMenu collapseBelow="always" menuGroups={groups} onClose={onClose} />, {
      wrapper: wrap,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Blog" }));
    });
    expect(onClose).toHaveBeenCalled();
  });
});

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { Column } from "../components/Column";
import { Dropdown } from "../components/Dropdown";
import { IconButton } from "../components/IconButton";
import { Option } from "../components/Option";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Select failed axe three ways: its input carried `aria-expanded` without
 * being a combobox, DropdownWrapper wrapped it in two `role="button"`
 * elements (an input inside a button), and the open panel nested three
 * listboxes. It now follows the ARIA combobox pattern: the field is a
 * `combobox` that keeps focus, controls one `listbox`, and points at the
 * active option with `aria-activedescendant`.
 */

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie", disabled: true },
  { value: "d", label: "Delta" },
];

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Picker = (
  props: Partial<React.ComponentProps<typeof Select>> & { onPick?: (v: string) => void },
) => {
  const { onPick, ...rest } = props;
  const [value, setValue] = useState<string | string[]>(rest.multiple ? [] : "b");
  return (
    <>
      <button type="button">Before</button>
      <Select
        id="s"
        label="Pick"
        options={options}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onPick?.(next as string);
        }}
        {...rest}
      />
      <button type="button">After</button>
    </>
  );
};

const field = () => screen.getByRole("combobox", { name: "Pick" }) as HTMLInputElement;
const listbox = () => screen.getByRole("listbox", { name: "Pick" });
const option = (name: string) => screen.getByRole("option", { name });

/** Long enough for every deferred focus hand-off in the dropdown to have run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(field());
  await waitFor(() => expect(field()).toHaveAttribute("aria-expanded", "true"));
  await settle();
};

const expectActive = (name: string, on: HTMLElement = field()) => {
  expect(on).toHaveFocus();
  expect(on).toHaveAttribute("aria-activedescendant", option(name).id);
};

describe("Select as a combobox", () => {
  it("is a collapsed combobox named by its label, with no button around it", () => {
    render(<Picker />, { wrapper: wrap });

    expect(field()).toHaveAttribute("aria-haspopup", "listbox");
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(field()).not.toHaveAttribute("aria-controls");
    expect(field()).not.toHaveAttribute("aria-activedescendant");
    // Only the two buttons around it: the wrappers no longer claim the role.
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Before",
      "After",
    ]);
  });

  it("has no button around it in the server markup either", () => {
    const html = renderToString(
      <LayoutProvider>
        <Select id="s" label="Pick" options={options} />
      </LayoutProvider>,
    );
    expect(html).toContain('role="combobox"');
    expect(html).not.toContain('role="button"');
  });

  it("controls one listbox of options when open, active on the selection", async () => {
    const user = userEvent.setup();
    render(<Picker />, { wrapper: wrap });
    await open(user);

    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    expect(field()).toHaveAttribute("aria-controls", listbox().id);
    expect(within(listbox()).getAllByRole("option")).toHaveLength(4);
    expect(option("Bravo")).toHaveAttribute("aria-selected", "true");
    expect(option("Alpha")).toHaveAttribute("aria-selected", "false");
    expectActive("Bravo");
  });

  it("moves the active option with the arrow keys, Home and End, skipping disabled ones", async () => {
    const user = userEvent.setup();
    render(<Picker />, { wrapper: wrap });
    await open(user);

    await user.keyboard("{ArrowDown}");
    // Charlie is disabled.
    expectActive("Delta");
    await user.keyboard("{ArrowDown}");
    expectActive("Alpha");
    await user.keyboard("{ArrowUp}");
    expectActive("Delta");
    await user.keyboard("{Home}");
    expectActive("Alpha");
    await user.keyboard("{End}");
    expectActive("Delta");
  });

  it("opens with ArrowDown and picks with Enter, focus never leaving the field", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />, { wrapper: wrap });
    await open(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(field()).toHaveAttribute("aria-expanded", "false"));

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(field()).toHaveAttribute("aria-expanded", "true"));
    await user.keyboard("{ArrowUp}{Enter}");

    expect(onPick).toHaveBeenCalledWith("a");
    expect(field()).toHaveFocus();
    expect(field().value).toBe("Alpha");
    await settle();
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("picks with Space", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />, { wrapper: wrap });
    await open(user);

    await user.keyboard("{ArrowDown} ");
    expect(onPick).toHaveBeenCalledWith("d");
  });

  it("closes when Tab moves on, and leaves focus where Tab put it", async () => {
    const user = userEvent.setup();
    render(<Picker />, { wrapper: wrap });
    await open(user);

    await user.tab();
    await settle();
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("follows the pointer with the active option", async () => {
    const user = userEvent.setup();
    render(<Picker />, { wrapper: wrap });
    await open(user);

    await user.hover(option("Delta"));
    expect(field()).toHaveAttribute("aria-activedescendant", option("Delta").id);
  });

  it("marks a multiple Select's listbox multiselectable", async () => {
    const user = userEvent.setup();
    render(<Picker multiple />, { wrapper: wrap });
    await open(user);

    expect(listbox()).toHaveAttribute("aria-multiselectable", "true");
    await user.keyboard("{Enter}{ArrowDown}{Enter}");
    expect(option("Alpha")).toHaveAttribute("aria-selected", "true");
    expect(option("Bravo")).toHaveAttribute("aria-selected", "true");
    expect(field()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("a searchable Select", () => {
  const search = () => screen.getByRole("combobox", { name: "Search" }) as HTMLInputElement;

  it("searches in a combobox over the same listbox, keeping focus while the keys move", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker searchable onPick={onPick} />, { wrapper: wrap });
    await open(user);
    await waitFor(() => expect(search()).toHaveFocus());

    expect(search()).toHaveAttribute("aria-autocomplete", "list");
    expect(search()).toHaveAttribute("aria-expanded", "true");
    expect(search()).toHaveAttribute("aria-controls", listbox().id);

    await user.keyboard("a");
    // Alpha, Bravo, Charlie and Delta all contain an "a": the list keeps them.
    await user.keyboard("lpha");
    expect(within(listbox()).getAllByRole("option")).toHaveLength(1);
    expectActive("Alpha", search());

    await user.keyboard("{Enter}");
    expect(onPick).toHaveBeenCalledWith("a");
    await waitFor(() => expect(field()).toHaveFocus());
  });

  it("closes with Escape from the query and hands focus back to the field", async () => {
    const user = userEvent.setup();
    render(<Picker searchable />, { wrapper: wrap });
    await open(user);
    await waitFor(() => expect(search()).toHaveFocus());

    await user.keyboard("{Escape}");
    await waitFor(() => expect(field()).toHaveFocus());
    await settle();
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps focus in the query field when the query is cleared", async () => {
    const user = userEvent.setup();
    render(<Picker searchable />, { wrapper: wrap });
    await open(user);
    await waitFor(() => expect(search()).toHaveFocus());

    await user.keyboard("zz");
    expect(screen.getByText("No results")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(search()).toHaveFocus();
    expect(search().value).toBe("");
  });
});

describe("Select accessibility", () => {
  it("has no axe violations closed", async () => {
    const { container } = render(<Picker />, { wrapper: wrap });
    await expectNoAxeViolations(container);
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    render(<Picker />, { wrapper: wrap });
    await open(user);
    await expectNoAxeViolations(document.body);
  });

  it("has no axe violations open, searchable and with nothing found", async () => {
    const user = userEvent.setup();
    render(<Picker searchable />, { wrapper: wrap });
    await open(user);
    await expectNoAxeViolations(document.body);

    await waitFor(() => expect(screen.getByPlaceholderText("Search")).toHaveFocus());
    await user.keyboard("zz");
    await expectNoAxeViolations(document.body);
  });

  it("has no axe violations open, multiple", async () => {
    const user = userEvent.setup();
    render(<Picker multiple />, { wrapper: wrap });
    await open(user);
    await user.keyboard("{Enter}");
    await expectNoAxeViolations(document.body);
  });
});

/**
 * Every DropdownWrapper list nested a listbox (the Dropdown panel) inside
 * another (ArrowNavigation), the outer one owning no options of its own.
 */
describe("a Dropdown list (2.x DropdownWrapper)", () => {
  it("is one listbox when open, with no axe violations", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<Button>Options</Button>}>
        {
          <Column padding="4" gap="2">
            <Option value="rename" label="Rename" />
            <Option value="delete" label="Delete" />
          </Column>
        }
      </Dropdown>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("button", { name: "Options" }));
    await screen.findByRole("option", { name: "Rename" });
    await settle();

    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    await expectNoAxeViolations(document.body);
  });

  // Every list was named "Dropdown options", in English, whatever its
  // trigger said. It is labelled by its trigger, as a menu by its button.
  const openList = async (trigger: React.ReactElement, name: string) => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={trigger}>
        {
          <Column padding="4" gap="2">
            <Option value="rename" label="Rename" />
          </Column>
        }
      </Dropdown>,
      { wrapper: wrap },
    );
    const button = screen.getByRole("button", { name });
    await user.click(button);
    const option = await screen.findByRole("option", { name: "Rename" });
    const listbox = screen.getByRole("listbox");
    expect(listbox).toContainElement(option);
    expect(listbox).not.toHaveAttribute("aria-label");
    // The element it is labelled by is the trigger, the button in it.
    const label = document.getElementById(listbox.getAttribute("aria-labelledby") ?? "");
    expect(label).toContainElement(button);
    return listbox;
  };

  it("is named after a Button trigger's text", async () => {
    await openList(<Button>Sort by</Button>, "Sort by");
    expect(screen.getByRole("listbox", { name: "Sort by" })).toBeInTheDocument();
  });

  it("is named after an IconButton trigger's label", async () => {
    await openList(<IconButton icon="chevronDown" aria-label="More actions" />, "More actions");
    // Testing Library's name engine skips a button's aria-label inside the
    // element a name is taken from; axe, like the browsers, reads it, and
    // fails a listbox it finds no name for.
    await settle();
    await expectNoAxeViolations(document.body);
  });
});

describe("Select options' own prefix", () => {
  const swatched = [
    { value: "a", label: "Alpha", prefix: <span data-testid="swatch-a" /> },
    { value: "b", label: "Bravo", prefix: <span data-testid="swatch-b" /> },
  ];

  it("shows each option's prefix in a single Select", async () => {
    const user = userEvent.setup();
    render(<Select id="s" label="Colour" value="a" onValueChange={vi.fn()} options={swatched} />, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByTestId("swatch-a")).toBeInTheDocument();
    expect(within(listbox).getByTestId("swatch-b")).toBeInTheDocument();
  });

  it("keeps it after the check mark in a multiple Select", async () => {
    const user = userEvent.setup();
    render(
      <Select
        id="m"
        label="Colours"
        multiple
        value={["a"]}
        onValueChange={vi.fn()}
        options={swatched}
      />,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const alpha = within(listbox).getByRole("option", { name: /Alpha/ });
    expect(within(alpha).getByTestId("swatch-a")).toBeInTheDocument();
    expect(alpha.querySelector("svg")).not.toBeNull();
    expect(within(listbox).getByTestId("swatch-b")).toBeInTheDocument();
  });
});

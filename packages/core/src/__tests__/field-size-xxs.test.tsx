import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { ColorInput } from "../components/ColorInput";
import { DateInput } from "../components/DateInput";
import { DateRangeInput } from "../components/DateRangeInput";
import { Form } from "../components/Form";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";
import { NumberInput } from "../components/NumberInput";
import { PasswordInput } from "../components/PasswordInput";
import { Select } from "../components/Select";
import { TagInput } from "../components/TagInput";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `size="xxs"`: a 32px field, the height of a small Button, so a dashboard
 * toolbar can be all small controls. Input bottomed out at 40px (`xs`).
 *
 * Additive: `xs` to `xl` and the `m` default are untouched, and these tests
 * pin that too. jsdom does not lay out, so heights are checked where they are
 * declared — the size class on the field and the token it maps to.
 */

const SRC = join(import.meta.dirname, "..", "components");

const surface = (c: ParentNode = document) =>
  c.querySelector<HTMLElement>("[data-surface='field']");

/** The t-shirt class on an element, matching CSS Modules' `_xs_hash` too. */
const sizeClass = (el: Element | null) =>
  (["xxs", "xs", "s", "m", "l", "xl"] as const)
    .filter((s) => new RegExp(`(?:^|[\\s_])${s}(?=_|\\s|$)`).test(el?.className.toString() ?? ""))
    .join(",");

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** The body of one top-level rule in a stylesheet. */
const rule = (scss: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return scss.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
};

describe("Input size xxs", () => {
  it("is 32px, the height of a small Button", () => {
    const input = readFileSync(join(SRC, "Input.module.scss"), "utf8");
    const button = readFileSync(join(SRC, "Button.module.scss"), "utf8");
    expect(rule(input, ".xxs")).toMatch(/--fld-h-base:\s*var\(--static-space-32\)/);
    expect(rule(button, ".s")).toMatch(/\bheight:\s*var\(--static-space-32\)/);
    // No touch floor: a floor would make it the same field as xs on a phone.
    expect(rule(input, ".xxs")).toMatch(/--fld-h-touch:\s*0px/);
  });

  it("leaves the existing sizes where they were", () => {
    const input = readFileSync(join(SRC, "Input.module.scss"), "utf8");
    const heights = { xs: 40, s: 48, m: 56, l: 64, xl: 72 };
    for (const [size, px] of Object.entries(heights)) {
      expect(rule(input, `.${size}`), size).toMatch(
        new RegExp(`--fld-h-base:\\s*var\\(--static-space-${px}\\)`),
      );
    }
  });

  it("puts the size class and a small Button's radius on the field", () => {
    const { container } = render(<Input id="q" placeholder="Search" size="xxs" />);
    expect(sizeClass(surface(container))).toBe("xxs");
    expect(surface(container)?.className).toMatch(/\bradius-m\b/);
    expect(surface(container)?.className).not.toMatch(/\bradius-l\b/);
  });

  it("still defaults to m, rounded at radius-l", () => {
    const { container } = render(<Input id="q" label="Email" />);
    expect(sizeClass(surface(container))).toBe("m");
    expect(surface(container)?.className).toMatch(/\bradius-l\b/);
  });

  it("rounds a fused corner at radius-m too", () => {
    const { container } = render(<Input id="q" placeholder="From" size="xxs" corners="left" />);
    expect(surface(container)?.className).toMatch(/\bradius-m-left\b/);
  });

  it("shows the label as the placeholder and keeps it as the field's name", () => {
    const { container } = render(<Input id="q" label="Search" size="xxs" />);
    const field = screen.getByLabelText("Search") as HTMLInputElement;
    expect(field.placeholder).toBe("Search");
    const label = container.querySelector("label");
    expect(label?.className).toMatch(/labelHidden/);
    expect(label?.className).not.toMatch(/floating/);
  });

  it("lets the caller's placeholder win over the label", () => {
    render(<Input id="q" label="Owner" placeholder="Anyone" size="xxs" />);
    const field = screen.getByLabelText("Owner") as HTMLInputElement;
    expect(field.placeholder).toBe("Anyone");
  });

  it("pulls the prefix and suffix in to 8px, where a small Button puts its icon", () => {
    const { container } = render(
      <Input
        id="q"
        placeholder="Search"
        size="xxs"
        prefix={<Icon name="search" size="xs" />}
        suffix={<span>⌘K</span>}
      />,
    );
    expect(container.querySelector(".pl-8")).not.toBeNull();
    expect(container.querySelector(".pr-8")).not.toBeNull();
    expect(container.querySelector(".pl-12")).toBeNull();
  });

  it("keeps a 12px prefix inset at the existing sizes", () => {
    const { container } = render(
      <Input id="q" placeholder="Search" size="xs" prefix={<Icon name="search" size="xs" />} />,
    );
    expect(container.querySelector(".pl-12")).not.toBeNull();
  });

  it("comes down from a Form, and the Form rounds its group to match", () => {
    const { container } = render(
      <Form size="xxs" density="stacked">
        <Input id="a" label="First" />
        <Input id="b" label="Last" />
      </Form>,
    );
    const fields = container.querySelectorAll("[data-surface='field']");
    expect(fields).toHaveLength(2);
    for (const field of fields) expect(sizeClass(field)).toBe("xxs");
    expect(container.firstElementChild?.className).toMatch(/(?:^|[\s_])xxs(?=_|\s|$)/);
  });
});

describe("Textarea size xxs", () => {
  it("measures like an xxs input", () => {
    const area = render(<Textarea id="t" label="Note" size="xxs" />);
    expect(sizeClass(surface(area.container))).toBe("xxs");
    const textarea = area.container.querySelector("textarea");
    expect(textarea?.placeholder).toBe("Note");
    expect(area.container.querySelector("label")?.className).toMatch(/labelHidden/);
  });

  it("drops the textarea's inset floor at xxs, so its first line fits 32px", () => {
    const scss = readFileSync(join(SRC, "Input.module.scss"), "utf8");
    expect(rule(scss, ".base.xxs")).toMatch(/--fld-textarea-inset:\s*max\(0px/);
  });
});

describe("Select size xxs", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Bravo" },
  ];

  it("draws its field at xxs", () => {
    render(<Select id="s" label="Status" size="xxs" options={options} value="a" />, {
      wrapper: wrap,
    });
    const field = screen.getByRole("combobox", { name: "Status" });
    expect(sizeClass(field.closest("[data-surface='field']"))).toBe("xxs");
  });

  it.each([
    ["xxs", "xxs"],
    ["m", "s"],
    [undefined, "s"],
  ] as const)("at size %s, opens a search field at %s", async (size, expected) => {
    const user = userEvent.setup();
    render(<Select id="s" label="Status" size={size} searchable options={options} value="a" />, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    const search = await waitFor(() => screen.getByRole("combobox", { name: "Search" }));
    expect(sizeClass(search.closest("[data-surface='field']"))).toBe(expected);
  });
});

describe("fields built on Input, at xxs", () => {
  it.each([
    ["PasswordInput", <PasswordInput key="p" id="p" placeholder="Password" size="xxs" />],
    [
      "NumberInput",
      <NumberInput key="n" id="n" placeholder="Qty" size="xxs" aria-label="Quantity" />,
    ],
    ["DateInput", <DateInput key="d" id="d" placeholder="Date" size="xxs" />],
    [
      "ColorInput",
      <ColorInput key="c" id="c" placeholder="Colour" size="xxs" value="" onChange={() => {}} />,
    ],
    ["TagInput", <TagInput key="g" id="g" placeholder="Tags" size="xxs" />],
  ])("%s takes the size", (_name, element) => {
    const { container } = render(element, { wrapper: wrap });
    expect(sizeClass(surface(container))).toBe("xxs");
  });

  it("ColorInput shows its label where a colour input draws no placeholder", () => {
    const { container } = render(
      <ColorInput id="c" label="Brand colour" size="xxs" value="" onChange={() => {}} />,
      { wrapper: wrap },
    );
    expect(screen.getByLabelText("Brand colour")).toBeInTheDocument();
    const shown = Array.from(container.querySelectorAll("[aria-hidden='true']")).find(
      (el) => el.textContent === "Brand colour",
    );
    expect(shown).toBeDefined();
  });

  it("DateRangeInput takes it on both halves, rounded at radius-m", () => {
    const { container } = render(
      <DateRangeInput id="r" size="xxs" startLabel="From" endLabel="To" />,
      { wrapper: wrap },
    );
    const halves = container.querySelectorAll("[data-surface='field']");
    expect(halves).toHaveLength(2);
    expect(sizeClass(halves[0])).toBe("xxs");
    expect(halves[0].className).toMatch(/\bradius-m-left\b/);
    expect(halves[1].className).toMatch(/\bradius-m-right\b/);
  });

  it("NumberInput keeps both steppers, side by side, at xxs", () => {
    render(<NumberInput id="n" size="xxs" aria-label="Quantity" />, { wrapper: wrap });
    const up = screen.getByRole("button", { name: "Increment value", hidden: true });
    const down = screen.getByRole("button", { name: "Decrement value", hidden: true });
    expect(up.parentElement?.parentElement).toBe(down.parentElement?.parentElement);
    expect(up.parentElement?.parentElement?.className).toMatch(/steppersRow/);
  });
});

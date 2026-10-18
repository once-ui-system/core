/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Dimensions } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as native from "../src";
import {
  Avatar,
  Button,
  Checkbox,
  Column,
  createTheme,
  Dialog,
  defaultSettings,
  Feedback,
  flexStyle,
  IconButton,
  Input,
  RadioButton,
  RadioGroup,
  SegmentedControl,
  Select,
  Spinner,
  Switch,
  spacingStyle,
  Tag,
  Text,
  ThemeProvider,
  Toast,
} from "../src";
import { buttonColors } from "../src/components/Button";

afterEach(cleanup);

const light = createTheme(
  { ...defaultSettings, theme: "light", solid: "color" },
  Dimensions.get("window").width,
);

function rgb(hex: string) {
  const h = hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
  if (h.length === 8) {
    return `rgba(${r}, ${g}, ${b}, ${+(Number.parseInt(h.slice(6), 16) / 255).toFixed(2)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

const inLight = (ui: React.ReactNode) =>
  render(
    <ThemeProvider theme="light" solid="color">
      {ui}
    </ThemeProvider>,
  );

describe("3.0 units: a number is px", () => {
  it("reads numbers as points and px / rem strings by their unit", () => {
    expect(light.space(40)).toBe(40);
    expect(light.space("40px")).toBe(40);
    expect(light.space("2rem")).toBe(2 * light.rem);
    // Tokens are unchanged: a digit string is a static spacing step.
    expect(light.space("16")).toBe(light.px("static-space-16"));
  });

  it("applies px numbers and rem strings on spacing and size props", () => {
    expect(spacingStyle(light, { padding: 12, gap: "1rem" })).toMatchObject({
      padding: 12,
      gap: light.rem,
    });
    const { style } = flexStyle(light, { maxWidth: "20rem", minHeight: 48, width: "50%" });
    expect(style).toMatchObject({ maxWidth: 20 * light.rem, minHeight: 48, width: "50%" });
  });

  it("sizes an Avatar from a number in px", () => {
    inLight(<Avatar size={40} value="AB" />);
    const img = screen.getByRole("img");
    expect(getComputedStyle(img).width).toBe("40px");
  });
});

describe("3.0 tone and variant", () => {
  it("draws a primary Button in its tone", () => {
    inLight(<Button tone="danger" label="Delete" />);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(getComputedStyle(button).backgroundColor).toBe(rgb(light.color("danger-solid-medium")));
  });

  it("defaults the tone to brand on primary and neutral elsewhere, as core does", () => {
    expect(buttonColors(light, "primary", false).background).toBe(
      light.color("brand-solid-medium"),
    );
    expect(buttonColors(light, "secondary", false).label).toBe(
      light.color("neutral-on-background-strong"),
    );
    expect(buttonColors(light, "ghost", false, "danger").label).toBe(
      light.color("danger-on-background-medium"),
    );
    expect(buttonColors(light, "ghost", true, "danger").label).toBe(
      light.color("danger-on-background-strong"),
    );
  });

  it("takes core's onClick on Button and IconButton", () => {
    const onClick = vi.fn();
    inLight(
      <>
        <Button label="Go" onClick={onClick} />
        <IconButton icon="close" aria-label="Close" onClick={onClick} />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("tints Feedback and Toast by tone, with the tone's icon", () => {
    const { container } = inLight(
      <>
        <Feedback tone="warning" title="Low stock" />
        <Toast tone="success">Saved</Toast>
      </>,
    );
    expect(screen.getByText("Low stock")).toBeTruthy();
    expect(screen.getByText("Saved")).toBeTruthy();
    // Feedback's icon (shown by default, as in core) and the toast's.
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
  });

  it("uses textVariant on Text, with weight and family as overrides", () => {
    inLight(
      <Text textVariant="body-default-l" weight="strong">
        Bold
      </Text>,
    );
    const style = getComputedStyle(screen.getByText("Bold"));
    expect(style.fontSize).toBe(`${light.text("body-strong-l").fontSize}px`);
    expect(style.fontWeight).toBe(String(light.text("body-strong-l").fontWeight));
  });
});

describe("3.0 Tag: Badge and Chip folded in", () => {
  it("is a toggle with selected, announcing its state", () => {
    const onClick = vi.fn();
    inLight(<Tag label="Oat" selected={false} onClick={onClick} />);
    const tag = screen.getByRole("button", { name: "Oat" });
    expect(tag.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(tag);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps a static Tag a label, and takes removeButtonProps", () => {
    const onRemove = vi.fn();
    inLight(
      <>
        <Tag tone="info" label="Draft" />
        <Tag label="Cinnamon" onRemove={onRemove} removeButtonProps={{ "aria-label": "Drop" }} />
      </>,
    );
    expect(screen.queryByRole("button", { name: "Draft" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Drop" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("no longer exports Badge or Chip", () => {
    expect("Badge" in native).toBe(false);
    expect("Chip" in native).toBe(false);
  });
});

describe("3.0 state contract: X / defaultX / onXChange", () => {
  it("calls onCheckedChange on Checkbox and Switch, and names them by aria-label", () => {
    const onCheckedChange = vi.fn();
    inLight(
      <>
        <Checkbox aria-label="Terms" onCheckedChange={onCheckedChange} />
        <Switch aria-label="Sync" checked onCheckedChange={onCheckedChange} />
      </>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Terms" }));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    const sw = screen.getByRole("switch", { name: "Sync" });
    fireEvent.click(sw);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    // Controlled: `checked` holds until the parent changes it.
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });

  it("does nothing when a chosen RadioButton is picked again, as a native radio", () => {
    const onCheckedChange = vi.fn();
    inLight(<RadioButton label="Pick" defaultChecked onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Pick" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("shows a control's errorMessage", () => {
    inLight(
      <RadioGroup
        aria-label="Plan"
        errorMessage="Pick a plan"
        options={[{ value: "a", label: "A" }]}
      />,
    );
    expect(screen.getByText("Pick a plan")).toBeTruthy();
  });

  it("calls onValueChange on SegmentedControl and honours a group disabled", () => {
    const onValueChange = vi.fn();
    inLight(
      <SegmentedControl
        disabled
        onValueChange={onValueChange}
        buttons={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />,
    );
    fireEvent.click(screen.getAllByRole("tab")[1]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps an uncontrolled Select's value from defaultValue and reports open changes", () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    inLight(
      <Select
        id="venue"
        label="Venue"
        defaultValue="a"
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Venue" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByText("Beta"));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect((screen.getByLabelText("Venue", { selector: "input" }) as HTMLInputElement).value).toBe(
      "Beta",
    );
  });

  it("calls Input's onValueChange and reveals a password", () => {
    const onValueChange = vi.fn();
    inLight(<Input id="pw" label="Password" type="password" onValueChange={onValueChange} />);
    const field = screen.getByLabelText("Password") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "hunter2" } });
    expect(onValueChange).toHaveBeenCalledWith("hunter2");
    expect(field.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect((screen.getByLabelText("Password") as HTMLInputElement).type).not.toBe("password");
  });

  it("names a Spinner by aria-label", () => {
    inLight(<Spinner aria-label="Saving" />);
    expect(screen.getByLabelText("Saving")).toBeTruthy();
  });
});

describe("3.0 Dialog", () => {
  it("hides the close button with showClose={false}", () => {
    inLight(
      <Dialog open onClose={() => {}} title="Terms" showClose={false}>
        <Text>Read them</Text>
      </Dialog>,
    );
    expect(screen.getByText("Terms")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("renders a centred card with variant='center' and a backdrop slot", () => {
    vi.useFakeTimers();
    inLight(
      <Dialog
        open
        onClose={() => {}}
        title="Centred"
        variant="center"
        backdrop={<Column testID="backdrop" />}
      />,
    );
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
    expect(screen.getByText("Centred")).toBeTruthy();
    expect(screen.getByTestId("backdrop")).toBeTruthy();
  });
});

describe("the contract stays core 3.0's", () => {
  const SRC = join(__dirname, "../src/components");
  const CORE = join(__dirname, "../../core/src/components");
  const read = (dir: string, name: string) => readFileSync(join(dir, `${name}.tsx`), "utf8");

  it("uses none of the names core 3.0 removed", () => {
    for (const file of readdirSync(SRC).filter((f) => f.endsWith(".tsx"))) {
      const source = readFileSync(join(SRC, file), "utf8");
      // Props, not prose: `ariaLabel?:`, `onToggle?:` and friends. (`scheme`
      // stays in 3.0 as a palette hue, as on Avatar's status dot.)
      for (const removed of ["ariaLabel", "onToggle", "hideClose", "onSelect"]) {
        expect({
          file,
          prop: removed,
          found: new RegExp(`\\b${removed}\\??:`).test(source),
        }).toEqual({
          file,
          prop: removed,
          found: false,
        });
      }
    }
  });

  it("names every state handler core 3.0 names on the components both have", () => {
    const pairs: [string, string][] = [
      ["Checkbox", "Checkbox"],
      ["Switch", "Switch"],
      ["RadioButton", "RadioGroup"],
      ["RadioGroup", "RadioGroup"],
      ["SegmentedControl", "SegmentedControl"],
      ["Select", "Select"],
      ["Input", "Input"],
    ];
    for (const [core, file] of pairs) {
      const handlers = [...read(CORE, core).matchAll(/\b(on\w+Change)\?:/g)].map((m) => m[1]);
      expect(handlers.length).toBeGreaterThan(0);
      const source = read(SRC, file);
      for (const handler of handlers) {
        expect({ core, handler, found: source.includes(`${handler}?:`) }).toEqual({
          core,
          handler,
          found: true,
        });
      }
    }
  });

  it("takes `tone` wherever core 3.0 does", () => {
    for (const name of ["Button", "IconButton", "Tag", "Feedback", "Toast"]) {
      expect(read(CORE, name)).toMatch(/\btone\??:/);
      expect({ name, tone: /\btone\??:/.test(read(SRC, name)) }).toEqual({ name, tone: true });
    }
  });
});

describe("density", () => {
  it("gives a control with no size the density's, and picks its scaling", () => {
    let seen: { size?: string; scaling?: string } = {};
    function Probe() {
      const theme = native.useTheme();
      seen = { size: theme.controlSize, scaling: theme.settings.scaling };
      return null;
    }
    render(
      <ThemeProvider density="compact">
        <Probe />
      </ThemeProvider>,
    );
    expect(seen).toEqual({ size: "s", scaling: "95" });
    cleanup();
    render(
      <ThemeProvider density="spacious" scaling="90">
        <Probe />
      </ThemeProvider>,
    );
    expect(seen).toEqual({ size: "l", scaling: "90" });
    cleanup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(seen).toEqual({ size: "m", scaling: "100" });
  });
});

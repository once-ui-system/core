import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { act, render } from "@testing-library/react";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../components/Button";
import buttonStyles from "../components/Button.module.scss";
import { Checkbox } from "../components/Checkbox";
import { Form } from "../components/Form";
import { IconButton } from "../components/IconButton";
import iconButtonStyles from "../components/IconButton.module.scss";
import { RadioButton } from "../components/RadioButton";
import { RadioGroup } from "../components/RadioGroup";
import { SegmentedControl } from "../components/SegmentedControl";
import sharedStyles from "../components/SharedInteractiveStyles.module.scss";
import { Slider } from "../components/Slider";
import sliderStyles from "../components/Slider.module.scss";
import { Switch } from "../components/Switch";
import switchStyles from "../components/Switch.module.scss";
import { Tag } from "../components/Tag";
import tagStyles from "../components/Tag.module.scss";
import { ThemeInit } from "../components/ThemeInit";
import { ToggleButton } from "../components/ToggleButton";
import toggleStyles from "../components/ToggleButton.module.scss";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ThemeProvider, useStyle } from "../contexts/ThemeProvider";
import { DENSITIES, DENSITY_CONTROLS } from "../utils/density";

/**
 * The theme's `density` (`data-density`): compact, normal or spacious. It
 * gives every control left without a `size` the s, m or l look through CSS,
 * so it reaches server components and works without JS, and it picks the
 * theme's scaling (95, 100, 105) unless `scaling` is set.
 */

const root = document.documentElement;

afterEach(() => {
  localStorage.clear();
  for (const name of root.getAttributeNames()) {
    if (name.startsWith("data-")) root.removeAttribute(name);
  }
});

describe("ThemeProvider density", () => {
  it("writes data-density on <html>, normal by default", () => {
    const first = render(
      <ThemeProvider>
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-density")).toBe("normal");
    expect(root.getAttribute("data-scaling")).toBe("100");
    first.unmount();

    render(
      <ThemeProvider density="compact">
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-density")).toBe("compact");
  });

  it.each([
    ["compact", "95"],
    ["normal", "100"],
    ["spacious", "105"],
  ] as const)("%s picks scaling %s when scaling is not set", (density, scaling) => {
    render(
      <ThemeProvider density={density}>
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-scaling")).toBe(scaling);
  });

  it("a scaling that is set wins over the density's", () => {
    render(
      <ThemeProvider density="compact" scaling="110">
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-density")).toBe("compact");
    expect(root.getAttribute("data-scaling")).toBe("110");
  });

  it("a scaling chosen earlier (stored) wins too", () => {
    localStorage.setItem("data-scaling", "90");
    render(
      <ThemeProvider density="spacious">
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-scaling")).toBe("90");
  });

  it("setStyle({ density }) brings its scaling along, and stores only the density", () => {
    let setStyle: ReturnType<typeof useStyle>["setStyle"] = () => {};
    function Grab() {
      setStyle = useStyle().setStyle;
      return null;
    }
    render(
      <ThemeProvider>
        <Grab />
      </ThemeProvider>,
    );
    act(() => setStyle({ density: "spacious" }));
    expect(root.getAttribute("data-density")).toBe("spacious");
    expect(root.getAttribute("data-scaling")).toBe("105");
    expect(localStorage.getItem("data-density")).toBe("spacious");
    expect(localStorage.getItem("data-scaling")).toBeNull();

    // Once a scaling is chosen, a new density leaves it alone.
    act(() => setStyle({ scaling: "110" }));
    act(() => setStyle({ density: "compact" }));
    expect(root.getAttribute("data-scaling")).toBe("110");
  });
});

describe("ThemeInit density", () => {
  const run = (config: Record<string, string>) => {
    const element = ThemeInit({ config }) as React.ReactElement<{
      dangerouslySetInnerHTML: { __html: string };
    }>;
    new Function(element.props.dangerouslySetInnerHTML.__html)();
  };

  it("writes data-density and the density's scaling before paint", () => {
    run({ theme: "dark", density: "compact" });
    expect(root.getAttribute("data-density")).toBe("compact");
    expect(root.getAttribute("data-scaling")).toBe("95");
  });

  it("keeps a configured scaling", () => {
    run({ theme: "dark", density: "compact", scaling: "105" });
    expect(root.getAttribute("data-scaling")).toBe("105");
  });

  it("follows a density chosen on the page, unless a scaling was chosen too", () => {
    localStorage.setItem("data-density", "spacious");
    run({ theme: "dark", density: "compact" });
    expect(root.getAttribute("data-density")).toBe("spacious");
    expect(root.getAttribute("data-scaling")).toBe("105");

    localStorage.setItem("data-scaling", "90");
    run({ theme: "dark", density: "compact" });
    expect(root.getAttribute("data-scaling")).toBe("90");
  });
});

/**
 * Each control, rendered with no size, with an explicit m, and inside a Form
 * that sets one: the `auto` class (what `[data-density]` restyles) is there
 * only in the first case, so an explicit size always wins over the theme.
 */
const controls: Record<
  (typeof DENSITY_CONTROLS)[number],
  {
    auto: string;
    render: (size?: "m") => React.ReactElement;
    pick: (container: HTMLElement) => Element | null;
  }
> = {
  Button: {
    auto: buttonStyles.auto,
    render: (size) => <Button size={size}>Go</Button>,
    pick: (c) => c.querySelector(`.${buttonStyles.button}`),
  },
  IconButton: {
    auto: iconButtonStyles.auto,
    render: (size) => <IconButton size={size} icon="close" aria-label="Close" />,
    pick: (c) => c.querySelector(`.${buttonStyles.button}`),
  },
  ToggleButton: {
    auto: toggleStyles.auto,
    render: (size) => <ToggleButton size={size} label="Bold" />,
    pick: (c) => c.querySelector(`.${toggleStyles.button}`),
  },
  SegmentedControl: {
    auto: toggleStyles.auto,
    render: (size) => (
      <SegmentedControl
        aria-label="View"
        buttons={[
          { value: "a", label: "A", size },
          { value: "b", label: "B", size },
        ]}
      />
    ),
    pick: (c) => c.querySelector('[role="tab"]'),
  },
  Tag: {
    auto: tagStyles.auto,
    render: (size) => <Tag size={size} label="New" data-testid="tag" />,
    pick: (c) => c.querySelector('[data-testid="tag"]'),
  },
  Switch: {
    auto: switchStyles.auto,
    render: (size) => <Switch size={size} label="Wi-Fi" />,
    pick: (c) => c.querySelector(`.${switchStyles.container}`),
  },
  Checkbox: {
    auto: sharedStyles.auto,
    render: (size) => <Checkbox size={size} label="Agree" />,
    pick: (c) => c.querySelector(`.${sharedStyles.container}`),
  },
  RadioButton: {
    auto: sharedStyles.auto,
    render: (size) => <RadioButton size={size} value="a" label="A" />,
    pick: (c) => c.querySelector(`.${sharedStyles.container}`),
  },
  RadioGroup: {
    auto: sharedStyles.auto,
    render: (size) => (
      <RadioGroup
        size={size}
        aria-label="Plan"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />
    ),
    pick: (c) => c.querySelector(`.${sharedStyles.container}`),
  },
  Slider: {
    auto: sliderStyles.auto,
    render: (size) => <Slider size={size} aria-label="Volume" defaultValue={10} />,
    pick: (c) => c.querySelector(`.${sliderStyles.container}`),
  },
};

const r = (ui: React.ReactElement) => render(ui, { wrapper: LayoutProvider });

describe("controls follow the density through CSS", () => {
  it("covers every control the density lists", () => {
    expect(Object.keys(controls).sort()).toEqual([...DENSITY_CONTROLS].sort());
  });

  it.each(DENSITY_CONTROLS)("%s: no size is auto, an explicit size wins", (name) => {
    const control = controls[name];
    const auto = r(control.render()).container;
    expect(control.pick(auto)).toHaveClass(control.auto);

    const explicit = r(control.render("m")).container;
    expect(control.pick(explicit)).not.toBeNull();
    expect(control.pick(explicit)).not.toHaveClass(control.auto);
  });

  it("renders the same on the server, with no ThemeProvider and no effects", () => {
    const html = renderToStaticMarkup(
      <LayoutProvider>
        <Button>Go</Button>
        <Tag label="New" />
      </LayoutProvider>,
    );
    expect(html).toContain(buttonStyles.auto);
    expect(html).toContain(tagStyles.auto);
  });

  it("a Form's size counts as given: its fields are not auto", () => {
    const { container } = r(
      <Form size="m">
        <Checkbox label="Agree" />
        <Slider aria-label="Volume" defaultValue={10} />
      </Form>,
    );
    expect(container.querySelector(`.${sharedStyles.container}`)).not.toHaveClass(
      sharedStyles.auto,
    );
    expect(container.querySelector(`.${sliderStyles.container}`)).not.toHaveClass(
      sliderStyles.auto,
    );
  });
});

/**
 * The rules themselves, in the compiled modules the package ships: under each
 * density with a size of its own, the `auto` class is restyled.
 */
const DIST = join(__dirname, "..", "..", "dist", "components");
const MODULES = [
  "Button",
  "IconButton",
  "ToggleButton",
  "Tag",
  "Switch",
  "SharedInteractiveStyles",
  "Slider",
];

describe.skipIf(!existsSync(DIST))("compiled density rules", () => {
  it.each(MODULES)("%s.module.css restyles .auto under compact and spacious", (name) => {
    const css = readFileSync(join(DIST, `${name}.module.css`), "utf8");
    for (const [density, { size }] of Object.entries(DENSITIES)) {
      const selector = `html[data-density="${density}"]`;
      // normal is the m every control already draws: no rule of its own.
      if (size === "m") expect(css).not.toContain(selector);
      else expect(css).toMatch(new RegExp(`${selector.replace(/[[\]]/g, "\\$&")}\\)*\\) \\.auto`));
    }
  });
});

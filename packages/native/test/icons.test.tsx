import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { Dimensions } from "react-native";
import { afterEach, describe, expect, it } from "vitest";
import {
  Button,
  createTheme,
  defaultSettings,
  Icon,
  IconButton,
  IconProvider,
  Tag,
  ThemeProvider,
} from "../src";
import { iconData } from "../src/icons/data";

afterEach(cleanup);

// Sizes are in rem, which follows the screen width as on the web.
const { rem } = createTheme({ ...defaultSettings, theme: "light" }, Dimensions.get("window").width);

describe("icons", () => {
  it("ships exactly core's built-in icon names", () => {
    const core = readFileSync(join(__dirname, "../../core/src/icons/data.ts"), "utf8");
    const names = [...core.matchAll(/^ {2}(\w+): \{$/gm)].map((m) => m[1]);
    expect(Object.keys(iconData).sort()).toEqual(names.sort());
  });

  it("draws a built-in icon as SVG at its size", () => {
    const { container } = render(
      <ThemeProvider theme="light">
        <Icon name="arrowRight" size="l" />
      </ThemeProvider>,
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe(String(2 * rem));
    expect(container.querySelector("path")?.getAttribute("d")).toContain("M13.5 4.5");
  });

  it("takes icon names on Button and Tag, as core does", () => {
    const { container } = render(
      <ThemeProvider theme="light">
        <Button label="Next" suffixIcon="arrowRight" />
        <Tag label="New" prefixIcon="sparkle" />
      </ThemeProvider>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("names an IconButton from ariaLabel and draws registered icons", () => {
    const Rocket = ({ size }: { size: number }) => <span data-testid="rocket">{size}</span>;
    render(
      <ThemeProvider theme="light">
        <IconProvider icons={{ rocket: Rocket }}>
          <IconButton icon={"rocket" as "refresh"} ariaLabel="Launch" />
        </IconProvider>
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Launch" })).toBeTruthy();
    expect(screen.getByTestId("rocket").textContent).toBe(String(1.25 * rem));
  });
});

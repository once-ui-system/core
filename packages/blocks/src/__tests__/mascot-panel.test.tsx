import { LayoutProvider, type MascotDesign, ThemeProvider } from "@once-ui-system/core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { designJsx } from "../internal/mascotExport.js";
import {
  MascotPanel,
  MascotPanelAccessories,
  MascotPanelBody,
  MascotPanelRoot,
  randomMascotDesign,
} from "../MascotPanel.js";
import { expectNoAxeViolations } from "../test/axe.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </LayoutProvider>
);

afterEach(() => window.localStorage.clear());

describe("MascotPanel", () => {
  it("edits a controlled design and reports what changed", () => {
    const onValueChange = vi.fn();
    render(<MascotPanel value={{ v: 1 }} onValueChange={onValueChange} />, { wrapper });
    fireEvent.click(screen.getByRole("radio", { name: "Matte" }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      { v: 1, surface: "matte" },
      { surface: "matte" },
    );
    fireEvent.click(screen.getByRole("radio", { name: "Body color: Accent" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ v: 1, color: "accent" }, { color: "accent" });
  });

  it("wears several accessories, in their own order, and takes them off", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <MascotPanelRoot value={{ v: 1, accessory: ["crown"] }} onValueChange={onValueChange}>
        <MascotPanelAccessories />
      </MascotPanelRoot>,
      { wrapper },
    );
    const wears = screen.getByRole("group", { name: "Wears" });
    expect(within(wears).getByRole("button", { name: "Crown" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    fireEvent.click(within(wears).getByRole("button", { name: "Antenna" }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      { v: 1, accessory: ["antenna", "crown"] },
      { accessory: ["antenna", "crown"] },
    );
    rerender(
      <MascotPanelRoot value={{ v: 1, accessory: ["crown"] }} onValueChange={onValueChange}>
        <MascotPanelAccessories />
      </MascotPanelRoot>,
    );
    fireEvent.click(within(wears).getByRole("button", { name: "Crown" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ v: 1, accessory: [] }, { accessory: [] });
  });

  it("drops a working style set back to none, and shows sides only with one", () => {
    const onValueChange = vi.fn();
    const design: MascotDesign = { v: 1, working: "d20" };
    render(<MascotPanel value={design} onValueChange={onValueChange} />, { wrapper });
    expect(screen.getByRole("radiogroup", { name: "Sides" })).toBeTruthy();
    const style = screen.getByRole("radiogroup", { name: "Style" });
    fireEvent.click(within(style).getByRole("radio", { name: "None" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ v: 1 }, { working: undefined });
  });

  it("remembers an uncontrolled design under storageKey", async () => {
    window.localStorage.setItem("mascot", JSON.stringify({ v: 1, eyes: "round" }));
    render(<MascotPanel storageKey="mascot" />, { wrapper });
    const eyes = screen.getByRole("radiogroup", { name: "Eyes" });
    expect(within(eyes).getByRole("radio", { name: "Round" }).getAttribute("aria-checked")).toBe(
      "true",
    );
    await act(async () => {
      fireEvent.click(within(eyes).getByRole("radio", { name: "Pill" }));
    });
    expect(JSON.parse(window.localStorage.getItem("mascot") ?? "{}")).toEqual({
      v: 1,
      eyes: "pill",
    });
  });

  it("tries states and moods on the preview without saving them", () => {
    const onValueChange = vi.fn();
    render(<MascotPanel value={{ v: 1 }} onValueChange={onValueChange} />, { wrapper });
    fireEvent.click(screen.getByRole("radio", { name: "Thinking" }));
    fireEvent.click(screen.getByRole("radio", { name: "Love" }));
    const preview = screen.getByRole("img", { name: "Mascot preview" });
    expect(preview.getAttribute("data-state")).toBe("thinking");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("hides sections and rows, and translates", () => {
    render(
      <MascotPanel
        value={{ v: 1 }}
        visibility={{ working: { section: false }, body: { aspect: false } }}
        labels={{ groups: { body: { title: "Test" } }, rows: { roundness: "Kerekség" } }}
      />,
      { wrapper },
    );
    expect(screen.queryByText("Working")).toBeNull();
    expect(screen.queryByText("Width")).toBeNull();
    expect(screen.getByText("Test")).toBeTruthy();
    expect(screen.getByText("Kerekség")).toBeTruthy();
  });

  it("composes from its parts", () => {
    render(
      <MascotPanelRoot defaultValue={{ v: 1, roundness: 0.2 }}>
        <MascotPanelBody rows={{ color: false }} />
      </MascotPanelRoot>,
      { wrapper },
    );
    expect(screen.queryByRole("radiogroup", { name: "Color" })).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Surface" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(<MascotPanel value={{ v: 1, working: "cube" }} />, { wrapper });
    await expectNoAxeViolations(container);
  });
});

describe("MascotPanel helpers", () => {
  it("writes the design as JSX", () => {
    expect(designJsx({ v: 1 })).toBe("<Mascot />");
    expect(designJsx({ v: 1, eyes: "round", brows: true })).toBe('<Mascot eyes="round" brows />');
    expect(
      designJsx({ v: 1, eyes: "round", brows: true, roundness: 0.4, accessory: ["bow"] }),
    ).toBe('<Mascot\n  eyes="round"\n  brows\n  roundness={0.4}\n  accessory={["bow"]}\n/>');
  });

  it("randomizes the look and keeps how it works", () => {
    const design = randomMascotDesign({ working: "cube", face: "flat" });
    expect(design.v).toBe(1);
    expect(design.working).toBe("cube");
    expect(design.face).toBe("flat");
    expect(design.color).toMatch(/^oklch/);
  });
});

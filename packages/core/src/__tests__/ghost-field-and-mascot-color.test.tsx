import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "../components/Input";
import styles from "../components/Input.module.scss";
import { Textarea } from "../components/Textarea";

/**
 * Two fixes reported from an app on 3.0. A ghost field inside a framed
 * composer gained a border of its own on focus, a second box inside the
 * frame. And the cube mascot painted `color="var(--x)"` black, because a
 * canvas fillStyle can't read custom properties.
 */

const surface = (name: string) =>
  screen.getByRole("textbox", { name }).closest("[data-surface='field']");

describe("ghost field focus", () => {
  it("marks ghost inputs and textareas so the focus border skips them", () => {
    render(
      <>
        <Input id="a" aria-label="Ghost input" variant="ghost" />
        <Textarea id="b" aria-label="Ghost textarea" variant="ghost" />
        <Input id="c" aria-label="Plain input" />
      </>,
    );
    expect(surface("Ghost input")).toHaveClass(styles.ghost);
    expect(surface("Ghost textarea")).toHaveClass(styles.ghost);
    expect(surface("Plain input")).not.toHaveClass(styles.ghost);
  });
});

describe("MascotCube resolveColor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    document.documentElement.removeAttribute("style");
  });

  // A stand-in 2D context: records what was painted and reads back a fixed
  // pixel per colour, enough to see which string reached fillStyle.
  const fakeCanvas = () => {
    const painted: string[] = [];
    const pixels: Record<string, number[]> = {
      "#ff0000": [255, 0, 0, 255],
      "#00ff00": [0, 255, 0, 255],
    };
    let fill = "";
    const ctx = {
      clearRect() {},
      fillRect() {},
      set fillStyle(value: string) {
        fill = value;
        painted.push(value);
      },
      get fillStyle() {
        return fill;
      },
      getImageData: () => ({ data: pixels[fill] ?? [0, 0, 0, 255] }),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    return painted;
  };

  it("looks var() up on the node before painting", async () => {
    const painted = fakeCanvas();
    const { resolveColor } = await import("../modules/ai/MascotCube");
    document.documentElement.style.setProperty("--mascot-test", "#ff0000");
    expect(resolveColor(document.documentElement, "var(--mascot-test)")).toEqual([1, 0, 0]);
    expect(painted).not.toContain("var(--mascot-test)");
  });

  it("uses the var() fallback when the property is unset, and the default when nothing resolves", async () => {
    fakeCanvas();
    const { resolveColor } = await import("../modules/ai/MascotCube");
    const node = document.documentElement;
    expect(resolveColor(node, "var(--unset, #00ff00)")).toEqual([0, 1, 0]);
    expect(resolveColor(node, "var(--unset)", [0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3]);
  });
});

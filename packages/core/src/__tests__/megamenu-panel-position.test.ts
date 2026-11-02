import { describe, expect, it } from "vitest";
import { clampPanelLeft } from "../modules/navigation/panelPosition";

// clampPanelLeft(triggerLeft, menuLeft, width, viewportWidth): the panel's
// left offset inside the menu, all in px.
describe("clampPanelLeft", () => {
  it("opens under the trigger when the panel fits", () => {
    expect(clampPanelLeft(300, 200, 400, 1440)).toBe(100);
  });

  it("moves a panel that would run past the right edge back inside, 16px from it", () => {
    // Trigger at 1000, panel 600 wide: right edge would be 1600 in a 1440 window.
    const left = clampPanelLeft(1000, 200, 600, 1440);
    expect(200 + left + 600).toBe(1440 - 16);
  });

  it("keeps the left edge in view when the panel is wider than the window", () => {
    const left = clampPanelLeft(800, 200, 2000, 1100);
    expect(200 + left).toBe(16);
  });

  it("never moves a panel right of its trigger", () => {
    expect(clampPanelLeft(50, 0, 300, 1440)).toBe(50);
  });
});

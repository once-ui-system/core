import { describe, expect, it } from "vitest";
import { createTheme, defaultSettings } from "../src";
import { touchSlop } from "../src/components/touch";

describe("touchSlop", () => {
  const phone = createTheme({ ...defaultSettings, theme: "light" }, 390);
  const tablet = createTheme({ ...defaultSettings, theme: "light" }, 900);

  it("grows a small control to core's 2.75rem touch target", () => {
    // 2.75rem at 15pt rem on phones is 41.25pt; a 24pt control gets 8.625pt each side.
    expect(touchSlop(phone, 24)).toEqual({ top: 8.625, bottom: 8.625, left: 8.625, right: 8.625 });
    expect(touchSlop(tablet, 24, Number.POSITIVE_INFINITY)).toEqual({
      top: 10,
      bottom: 10,
      left: 0,
      right: 0,
    });
  });

  it("leaves a control that is already big enough alone", () => {
    expect(touchSlop(tablet, 48)).toBeUndefined();
  });
});

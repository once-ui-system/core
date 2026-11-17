import { describe, expect, it } from "vitest";
import { formatChartDate, isCalendarDay, toChartDate } from "../modules/data/utils/chartDate";
import { formatDate } from "../modules/data/utils/formatDate";

describe("chart dates", () => {
  it("reads a date-only string as midnight UTC, like new Date()", () => {
    expect(toChartDate("2025-01-01")?.getTime()).toBe(new Date("2025-01-01").getTime());
  });

  it("keeps the time of a full ISO string", () => {
    expect(toChartDate("2025-01-01T10:30:00Z")?.toISOString()).toBe("2025-01-01T10:30:00.000Z");
  });

  it("returns undefined for values that are not dates", () => {
    expect(toChartDate("Jan")).toBeUndefined();
    expect(toChartDate(42)).toBeUndefined();
    expect(toChartDate(new Date("nope"))).toBeUndefined();
  });

  it("writes a calendar day as that day whatever the time zone", () => {
    const day = new Date("1980-01-01");
    expect(isCalendarDay(day)).toBe(true);
    expect(formatChartDate(day, "yyyy-MM-dd")).toBe("1980-01-01");
    expect(formatDate(day, { format: "yyyy" })).toBe("1980");
    expect(formatDate("1980-01-01", { format: "yyyy" })).toBe("1980");
  });
});

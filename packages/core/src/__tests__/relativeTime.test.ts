import { describe, expect, it } from "vitest";
import { formatRelativeTime, relativeTimeRefresh } from "../utils/relativeTime";

const now = new Date(2026, 9, 21, 12, 0);
const ago = (ms: number) => new Date(now.getTime() - ms);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it("says now under a minute", () => {
    expect(formatRelativeTime(ago(20_000), { now, locale: "en" })).toBe("now");
    expect(formatRelativeTime(ago(20_000), { now, locale: "hu" })).toBe("most");
  });

  it("is a bare narrow unit by default", () => {
    expect(formatRelativeTime(ago(2 * MINUTE), { now, locale: "en" })).toBe("2m");
    expect(formatRelativeTime(ago(90 * MINUTE), { now, locale: "en" })).toBe("1h");
    expect(formatRelativeTime(ago(3 * DAY), { now, locale: "en" })).toBe("3d");
    expect(formatRelativeTime(ago(15 * DAY), { now, locale: "en" })).toBe("2w");
  });

  it("follows the locale", () => {
    expect(formatRelativeTime(ago(3 * HOUR), { now, locale: "hu" })).toBe(
      new Intl.NumberFormat("hu", { style: "unit", unit: "hour", unitDisplay: "narrow" }).format(3),
    );
  });

  it("switches to the date after four weeks, with the year once it differs", () => {
    const older = new Date(2026, 6, 12);
    expect(formatRelativeTime(older, { now, locale: "en" })).toBe("Jul 12");
    expect(formatRelativeTime(new Date(2025, 6, 12), { now, locale: "en" })).toBe("Jul 12, 2025");
  });

  it("words it in full with short and long", () => {
    expect(formatRelativeTime(ago(5 * MINUTE), { now, locale: "en", style: "long" })).toBe(
      "5 minutes ago",
    );
    expect(formatRelativeTime(ago(DAY + HOUR), { now, locale: "en", style: "long" })).toBe(
      "yesterday",
    );
    expect(formatRelativeTime(ago(400 * DAY), { now, locale: "en", style: "long" })).toBe(
      "last year",
    );
  });

  it("keeps the direction of a future time", () => {
    expect(formatRelativeTime(now.getTime() + 5 * MINUTE, { now, locale: "en" })).toBe("in 5m");
  });

  it("takes a timestamp or an ISO string, and an invalid one is empty", () => {
    expect(formatRelativeTime(ago(2 * MINUTE).toISOString(), { now, locale: "en" })).toBe("2m");
    expect(formatRelativeTime("not a date", { now })).toBe("");
  });
});

describe("relativeTimeRefresh", () => {
  it("waits until the wording would change", () => {
    expect(relativeTimeRefresh(ago(2 * MINUTE + 15_000), now)).toBe(46_000);
    expect(relativeTimeRefresh(ago(2 * HOUR), now)).toBe(HOUR + 1000);
  });
});

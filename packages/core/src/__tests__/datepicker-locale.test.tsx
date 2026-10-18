import { render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { DateInput } from "../components/DateInput";
import { DatePicker } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { getCalendarNames } from "../utils/calendarLocale";

/**
 * The date components showed month and weekday names in English only.
 * `locale` puts them in any language the platform's Intl knows; without it,
 * or with a tag Intl does not accept, they stay the English they were.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const oct = (day: number) => new Date(2026, 9, day);

/** The grid's name, once the calendar has synced to its value and drawn. */
const grid = () => waitFor(() => screen.getByRole("grid"));

const headers = () =>
  screen.getAllByRole("columnheader").map((header) => ({
    text: header.textContent,
    label: header.getAttribute("aria-label"),
  }));

describe("getCalendarNames", () => {
  it("keeps the English names without a locale", () => {
    const names = getCalendarNames();
    expect(names.months[0]).toBe("January");
    expect(names.weekdays).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
    expect(names.weekdayLabels[1]).toBe("Monday");
    expect(names.monthYear(9, 2026)).toBe("October 2026");
  });

  it("falls back to English for a tag Intl does not accept", () => {
    expect(getCalendarNames("not a locale!")).toBe(getCalendarNames());
  });

  it("names months and weekdays in the locale, Sunday first", () => {
    const names = getCalendarNames("de");
    expect(names.months).toHaveLength(12);
    expect(names.months[2]).toBe("März");
    expect(names.weekdayLabels[0]).toBe("Sonntag");
    expect(names.weekdayLabels[1]).toBe("Montag");
    expect(names.monthYear(9, 2026)).toBe("Oktober 2026");
  });

  it("starts a lower-case month name with a capital", () => {
    const names = getCalendarNames("es");
    expect(names.months[9]).toBe("Octubre");
    expect(names.monthYear(9, 2026)).toMatch(/^Octubre/);
  });

  it("keeps the locale's order of month and year", () => {
    expect(getCalendarNames("ja").monthYear(9, 2026)).toBe("2026年10月");
  });
});

describe("DatePicker locale", () => {
  it("shows English names when no locale is given", async () => {
    render(<DatePicker value={oct(13)} />, { wrapper });
    expect(await grid()).toHaveAttribute("aria-label", "October 2026");
    expect(screen.getByRole("button", { name: /October/ })).toBeInTheDocument();
    expect(headers()[1]).toEqual({ text: "Mo", label: "Monday" });
  });

  it("shows the month, the grid's name and the weekdays in the locale", async () => {
    render(<DatePicker value={oct(13)} locale="fr" />, { wrapper });
    expect(await grid()).toHaveAttribute("aria-label", "Octobre 2026");
    expect(screen.getByRole("button", { name: /Octobre/ })).toBeInTheDocument();
    const monday = headers()[1];
    expect(monday.label).toBe("lundi");
    expect(monday.text).toBe(
      new Intl.DateTimeFormat("fr", { weekday: "short", timeZone: "UTC" }).format(
        new Date(Date.UTC(2023, 0, 2)),
      ),
    );
  });

  it("passes the locale to both of DatePicker range's calendars", async () => {
    render(
      <DatePicker
        range
        months={2}
        value={{ startDate: oct(13), endDate: undefined }}
        locale="de"
      />,
      { wrapper },
    );
    await waitFor(() => {
      const names = screen.getAllByRole("grid").map((g) => g.getAttribute("aria-label"));
      expect(names).toEqual(["Oktober 2026", "November 2026"]);
    });
  });
});

describe("date fields locale", () => {
  it("DateInput writes its value in the locale", () => {
    render(<DateInput id="when" label="When" value={oct(13)} locale="de" />, { wrapper });
    expect(screen.getByRole("combobox")).toHaveValue(
      oct(13).toLocaleString("de", { year: "numeric", month: "short", day: "numeric" }),
    );
  });

  it("DateInput keeps US English without a locale", () => {
    render(<DateInput id="when" label="When" value={oct(13)} />, { wrapper });
    expect(screen.getByRole("combobox")).toHaveValue("Oct 13, 2026");
  });

  it("DateInput range writes both dates in the locale", () => {
    render(
      <DateInput
        range
        id="stay"
        startLabel="Start"
        endLabel="End"
        value={{ startDate: oct(13), endDate: oct(16) }}
        locale="de"
      />,
      { wrapper },
    );
    const [start, end] = screen.getAllByRole("combobox");
    const options = { year: "numeric", month: "short", day: "numeric" } as const;
    expect(start).toHaveValue(oct(13).toLocaleDateString("de", options));
    expect(end).toHaveValue(oct(16).toLocaleDateString("de", options));
  });
});

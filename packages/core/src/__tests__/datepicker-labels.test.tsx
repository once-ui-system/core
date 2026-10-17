import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { DateInput } from "../components/DateInput";
import { DatePicker } from "../components/DatePicker";
import { DateRangeInput } from "../components/DateRangeInput";
import { DateRangePicker } from "../components/DateRangePicker";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { getCalendarNames } from "../utils/calendarLocale";

/**
 * The date components' own words ("Previous month", "Hours", AM/PM...) and
 * Select's "Search" and "Clear" were English only. `labels` translates them,
 * and `locale` now puts the time picker's time and AM/PM in the locale too.
 * The month and year buttons were named by their value alone ("March",
 * "2026"), which says nothing of what they do; DateRangeInput gave both its
 * fields the same `id`.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const oct = (day: number, hours = 0, minutes = 0) => new Date(2026, 9, day, hours, minutes);

const grid = () => waitFor(() => screen.getByRole("grid"));

describe("getCalendarNames time", () => {
  it("keeps the English 12-hour time without a locale", () => {
    const names = getCalendarNames();
    expect(names.dayPeriods).toEqual(["AM", "PM"]);
    expect(names.time(13, 14)).toBe("01:14 PM");
    expect(names.time(0, 5)).toBe("12:05 AM");
    expect(names.time(12, 0)).toBe("12:00 PM");
  });

  it("writes the time in the locale's order and words", () => {
    const names = getCalendarNames("ja");
    expect(names.dayPeriods[1]).toBe("午後");
    expect(names.time(13, 14)).toBe("午後01:14");
  });

  it("puts given day periods in place of the locale's", () => {
    expect(getCalendarNames().time(21, 30, ["vorm.", "nachm."])).toBe("09:30 nachm.");
    expect(getCalendarNames("ja").time(9, 0, ["朝", "夜"])).toBe("朝09:00");
  });
});

describe("DatePicker month and year buttons", () => {
  it("say what they are, not only the value they show", async () => {
    render(<DatePicker value={oct(13)} />, { wrapper });
    await grid();
    expect(
      screen.getByRole("button", { name: "Month: October, change month" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Year: 2026, change year" })).toBeInTheDocument();
  });

  it("keep the visible month in the name in another locale", async () => {
    render(<DatePicker value={oct(13)} locale="de" />, { wrapper });
    await grid();
    expect(screen.getByRole("button", { name: "Month: Oktober, change month" })).toHaveTextContent(
      "Oktober",
    );
  });
});

describe("DatePicker labels", () => {
  const german = {
    previousMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    month: (month: string) => `Monat: ${month}, Monat ändern`,
    year: (year: number) => `Jahr: ${year}, Jahr ändern`,
  };

  it("names the arrows and the month and year buttons from labels", async () => {
    render(<DatePicker value={oct(13)} locale="de" labels={german} />, { wrapper });
    await grid();
    expect(screen.getByRole("button", { name: "Vorheriger Monat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nächster Monat" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Monat: Oktober, Monat ändern" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jahr: 2026, Jahr ändern" })).toBeInTheDocument();
  });

  it("keeps the English default for a label left out", async () => {
    render(<DatePicker value={oct(13)} labels={{ nextMonth: "Weiter" }} />, { wrapper });
    await grid();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
  });

  it("passes labels to both of DateRangePicker's calendars", async () => {
    render(
      <DateRangePicker dual value={{ startDate: oct(13), endDate: undefined }} labels={german} />,
      {
        wrapper,
      },
    );
    await waitFor(() => expect(screen.getAllByRole("grid")).toHaveLength(2));
    expect(screen.getAllByRole("button", { name: /^Monat: .*, Monat ändern$/ })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Vorheriger Monat" })).toBeInTheDocument();
  });
});

describe("DatePicker time in a locale", () => {
  it("writes the header time in the locale", async () => {
    render(<DatePicker timePicker value={oct(13, 13, 14)} locale="ja" />, { wrapper });
    await grid();
    expect(screen.getByText("午後01:14")).toBeInTheDocument();
  });

  it("uses am and pm labels over the locale's words", async () => {
    render(<DatePicker timePicker value={oct(13, 13, 14)} labels={{ am: "a.m.", pm: "p.m." }} />, {
      wrapper,
    });
    await grid();
    expect(screen.getByText("01:14 p.m.")).toBeInTheDocument();
  });

  it("names the time panel's fields, back button and AM/PM from labels and locale", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        timePicker
        value={oct(13, 9, 5)}
        locale="ja"
        labels={{ hours: "時", minutes: "分", backToCalendar: "カレンダーに戻る" }}
      />,
      { wrapper },
    );
    await grid();
    const day = document.querySelector<HTMLButtonElement>(
      `button[data-value="${oct(14).toISOString()}"]`,
    );
    if (!day) throw new Error("No day button for 14 October");
    await user.click(day);

    expect(await screen.findByLabelText("時")).toHaveAttribute("placeholder", "時");
    expect(screen.getByLabelText("分")).toHaveAttribute("placeholder", "分");
    expect(screen.getByRole("button", { name: "カレンダーに戻る" })).toBeInTheDocument();
    const [am, pm] = getCalendarNames("ja").dayPeriods;
    expect(screen.getByText(am)).toBeInTheDocument();
    expect(screen.getByText(pm)).toBeInTheDocument();
  });
});

describe("date fields pass labels on", () => {
  it("DateInput's calendar takes its labels", async () => {
    const user = userEvent.setup();
    render(<DateInput id="when" label="When" value={oct(13)} labels={{ nextMonth: "Weiter" }} />, {
      wrapper,
    });
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("button", { name: "Weiter" })).toBeInTheDocument();
  });

  it("DateRangeInput's calendar takes its labels", async () => {
    const user = userEvent.setup();
    render(
      <DateRangeInput
        id="stay"
        startLabel="Start"
        endLabel="End"
        value={{ startDate: oct(13), endDate: oct(16) }}
        labels={{ nextMonth: "Weiter" }}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("combobox", { name: "Start" }));
    expect(await screen.findByRole("button", { name: "Weiter" })).toBeInTheDocument();
  });
});

describe("DateRangeInput ids", () => {
  it("gives each field an id of its own, derived from `id`", () => {
    render(<DateRangeInput id="stay" startLabel="Start" endLabel="End" />, { wrapper });
    const start = screen.getByRole("combobox", { name: "Start" });
    const end = screen.getByRole("combobox", { name: "End" });
    expect(start).toHaveAttribute("id", "stay-start");
    expect(end).toHaveAttribute("id", "stay-end");
    const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Select labels", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Bravo" },
  ];

  it("names the search field and its clear button from labels", async () => {
    const user = userEvent.setup();
    render(
      <Select
        id="pick"
        label="Pick"
        options={options}
        searchable
        labels={{ search: "Suchen", clear: "Leeren" }}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("combobox", { name: "Pick" }));
    const search = await screen.findByRole("combobox", { name: "Suchen" });
    expect(search).toHaveAttribute("placeholder", "Suchen");
    await waitFor(() => expect(search).toHaveFocus());
    await user.keyboard("zz");
    expect(screen.getByRole("button", { name: "Leeren" })).toBeInTheDocument();
  });

  it("keeps Search and Clear without labels", async () => {
    const user = userEvent.setup();
    render(<Select id="pick" label="Pick" options={options} searchable />, { wrapper });
    await user.click(screen.getByRole("combobox", { name: "Pick" }));
    const search = await screen.findByRole("combobox", { name: "Search" });
    await waitFor(() => expect(search).toHaveFocus());
    await user.keyboard("zz");
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });
});

describe("DatePicker week start", () => {
  const headers = () =>
    screen.getAllByRole("columnheader").map((h) => h.getAttribute("aria-label"));
  const leadingDays = (g: HTMLElement) =>
    Array.from(g.querySelectorAll('[role="row"]')[1].querySelectorAll("button[disabled]")).length;

  it("starts on Sunday without a locale, as it always has", async () => {
    render(<DatePicker value={oct(17)} />, { wrapper });
    const g = await grid();
    expect(headers()[0]).toBe("Sunday");
    // 1 October 2026 is a Thursday.
    expect(leadingDays(g)).toBe(4);
  });

  it("starts on the locale's first day of the week", async () => {
    render(<DatePicker value={oct(17)} locale="de" />, { wrapper });
    const g = await grid();
    expect(headers()[0]).toBe("Montag");
    expect(headers()[6]).toBe("Sonntag");
    expect(leadingDays(g)).toBe(3);
    expect(getCalendarNames("en-US").firstDayOfWeek).toBe(0);
  });
});

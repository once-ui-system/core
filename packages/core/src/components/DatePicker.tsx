"use client";

import classNames from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels.js";
import { Reveal } from "../internal/Reveal.js";
import { CondensedTShirtSizes } from "../types.js";
import { getCalendarNames } from "../utils/calendarLocale.js";
import {
  clearLastOpenedDropdown,
  getLastOpenedDropdown,
  setLastOpenedDropdown,
} from "../utils/dropdownState.js";
import { ArrowNavigation, useArrowNavigationContext } from "./ArrowNavigationContext.js";
import { Button } from "./Button.js";
import { Column } from "./Column.js";
import styles from "./DatePicker.module.scss";
import { Dropdown } from "./Dropdown.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { NumberInput } from "./NumberInput.js";
import { Option } from "./Option.js";
import { Row } from "./Row.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { Text } from "./Text.js";

/**
 * The picker's own words, for a translated interface. Omitted fields keep the
 * English default; month and weekday names and the time's AM/PM come from
 * `locale` instead.
 */
export interface DatePickerLabels {
  /** Defaults to `"Previous month"`. */
  previousMonth?: string;
  /** Defaults to `"Next month"`. */
  nextMonth?: string;
  /**
   * The month button's accessible name, given the month it shows. Defaults to
   * `"Month: March, change month"`. Keep the month in it: it is the button's visible text.
   */
  month?: (month: string) => string;
  /**
   * The year button's accessible name, given the year it shows. Defaults to
   * `"Year: 2026, change year"`. Keep the year in it: it is the button's visible text.
   */
  year?: (year: number) => string;
  /** The time panel's way back to the days. Defaults to `"Back to calendar"`. */
  backToCalendar?: string;
  /** The hour field's name and placeholder. Defaults to `"Hours"`. */
  hours?: string;
  /** The minute field's name and placeholder. Defaults to `"Minutes"`. */
  minutes?: string;
  /** The morning half of the 12-hour clock. Defaults to the locale's word ("AM" in English). */
  am?: string;
  /** The afternoon half of the 12-hour clock. Defaults to the locale's word ("PM" in English). */
  pm?: string;
}

const DEFAULT_LABELS: Required<Omit<DatePickerLabels, "am" | "pm">> &
  Pick<DatePickerLabels, "am" | "pm"> = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  month: (month) => `Month: ${month}, change month`,
  year: (year) => `Year: ${year}, change year`,
  backToCalendar: "Back to calendar",
  hours: "Hours",
  minutes: "Minutes",
  am: undefined,
  pm: undefined,
};

/** A range of dates, as `<DatePicker range>` and `<DateInput range>` take it. */
export interface DateRange {
  /** Unset until the first date is picked. */
  startDate?: Date;
  /** Unset until the second date is picked. */
  endDate?: Date;
}

/** One month's calendar: the single-date DatePicker, and each month of a range. */
interface CalendarProps
  extends Omit<React.ComponentProps<typeof Flex>, "onChange" | "defaultValue"> {
  /** The date, controlled. Leave it out to let the picker keep its own,
   *  starting from `defaultValue`. */
  value?: Date;
  /** The starting date of an uncontrolled DatePicker (no `value`). */
  defaultValue?: Date;
  /** Receives the date picked, and each time edit with `timePicker`. */
  onValueChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  previousMonth?: boolean;
  nextMonth?: boolean;
  timePicker?: boolean;
  defaultTime?: {
    hours: number;
    minutes: number;
  };
  size?: CondensedTShirtSizes;
  nested?: boolean;
  className?: string;
  style?: React.CSSProperties;
  currentMonth?: number;
  currentYear?: number;
  onMonthChange?: (increment: number) => void;
  /** The range to draw on this month: a range picker's selection, or its hover preview. */
  highlight?: {
    startDate?: Date;
    endDate?: Date;
  };
  onHover?: (date: Date | null) => void;
  /**
   * Moves focus onto the selected day (else the first day that can be
   * picked) as the picker appears, and again each time `open` turns true:
   * for a picker that has just been opened, as DateInput's is. Without it
   * the picker never takes focus on its own.
   */
  autoFocus?: boolean;
  open?: boolean;
  /**
   * The locale month and weekday names, and the time picker's time and AM/PM,
   * are shown in, as a BCP 47 tag such as "de" or "pt-BR". Without it (or
   * with a tag the platform does not accept) they are in English, as before.
   */
  locale?: string;
  /** The picker's buttons, fields and names, for a translated interface. */
  labels?: DatePickerLabels;
}

/** The days the grid's keys move through: this month's, that can be picked. */
const DAY_SELECTOR = "button[data-value]:not([disabled])";

/**
 * Keeps the grid's roving index on whichever day has focus, however it got
 * there: Tab, a click, or the picker's `autoFocus`. The index otherwise only
 * follows the arrow keys, and it no longer starts on a day when the grid
 * mounts (see `initialFocusedIndex`), so the keys could not tell where to
 * start from. Rendered inside the grid's ArrowNavigation, for its context.
 */
const FollowFocusedDay = ({ gridRef }: { gridRef: React.RefObject<HTMLDivElement | null> }) => {
  const { setFocusedIndex } = useArrowNavigationContext();
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const follow = (target: EventTarget | null) => {
      const index = Array.from(grid.querySelectorAll(DAY_SELECTOR)).indexOf(target as Element);
      if (index >= 0) setFocusedIndex(index);
    };
    const onFocusIn = (event: FocusEvent) => follow(event.target);
    grid.addEventListener("focusin", onFocusIn);
    // A day can take focus between the grid reaching the page and this
    // effect running: a quick Tab as the picker opens. Its focusin has
    // already fired, so pick the day up here, or the keys start from no
    // day and ArrowDown lands a week after the first.
    follow(document.activeElement);
    return () => grid.removeEventListener("focusin", onFocusIn);
  }, [gridRef, setFocusedIndex]);
  return null;
};

const Calendar = ({
  ref,
  value,
  defaultValue,
  onValueChange,
  timePicker = false,
  previousMonth = true,
  nextMonth = true,
  minDate,
  maxDate,
  defaultTime,
  size = "m",
  nested = false,
  className,
  style,
  currentMonth: propCurrentMonth,
  currentYear: propCurrentYear,
  onMonthChange,
  highlight: range,
  onHover,
  autoFocus = false,
  open,
  locale,
  labels,
  ...rest
}: CalendarProps) => {
  const names = mergeLabels(DEFAULT_LABELS, labels);
  const today = new Date();
  /** Where the picker starts: `value`, else `defaultValue` (2.x's `defaultDate` was never read). */
  const initialDate = value ?? defaultValue;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const initialTime =
    defaultTime ??
    (initialDate
      ? { hours: initialDate.getHours(), minutes: initialDate.getMinutes() }
      : undefined);
  const [selectedTime, setSelectedTime] = useState<
    | {
        hours: number;
        minutes: number;
      }
    | undefined
  >(initialTime);
  const [isPM, setIsPM] = useState(initialTime?.hours ? initialTime.hours >= 12 : false);
  /**
   * Whether `value` has ever been set. Until it has, the picker is
   * uncontrolled and keeps its own date; once it has, a `value` cleared
   * from outside clears the selection, as it always did.
   */
  const hadValueRef = useRef(value !== undefined);
  const [isTimeSelector, setIsTimeSelector] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  /**
   * The month is the caller's when it passes `currentMonth`, `currentYear`
   * and `onMonthChange`, as DateRangePicker does for each of its calendars:
   * the caller moves it, and `value` does not. A dual DateRangePicker gives
   * its second calendar the month after the first and the range's end as
   * its value, and letting that value move the month put both calendars on
   * the same month whenever the range sat inside one.
   */
  const monthIsControlled =
    propCurrentMonth !== undefined && propCurrentYear !== undefined && onMonthChange !== undefined;

  const [currentMonth, setCurrentMonth] = useState<number>(() =>
    monthIsControlled && propCurrentMonth !== undefined
      ? propCurrentMonth
      : (initialDate ?? today).getMonth(),
  );
  const [currentYear, setCurrentYear] = useState<number>(() =>
    monthIsControlled && propCurrentYear !== undefined
      ? propCurrentYear
      : (initialDate ?? today).getFullYear(),
  );

  /** The day grid, so its keys act on its own day buttons and not another calendar's. */
  const gridRef = useRef<HTMLDivElement>(null);
  /** The whole picker: its header controls as well as the grid. */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  /** The day button that last had focus: the grid's tab stop follows it. */
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof propCurrentMonth === "number") {
      setCurrentMonth(propCurrentMonth);
    }
    if (typeof propCurrentYear === "number") {
      setCurrentYear(propCurrentYear);
    }
  }, [propCurrentMonth, propCurrentYear]);

  // Track if calendar is synced to selected value
  const [isCalendarSynced, setIsCalendarSynced] = useState(false);

  /**
   * Whether focus was in the picker when a change of `value` unmounted the
   * grid to re-sync it. A pick from the keyboard in a controlled picker
   * (and a range's start pick) changes `value`, and the remounted grid
   * found focus on the page and left it there.
   */
  const refocusAfterSync = useRef(false);

  // Sync currentMonth/currentYear to value on mount and when value changes
  useEffect(() => {
    if (rootRef.current?.contains(document.activeElement)) refocusAfterSync.current = true;
    // Reset calendar sync to ensure proper re-sync
    setIsCalendarSynced(false);

    if (value) {
      if (!monthIsControlled) {
        setCurrentMonth(value.getMonth());
        setCurrentYear(value.getFullYear());
      }
      // Small delay to ensure state updates are processed
      const timer = setTimeout(() => {
        setIsCalendarSynced(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      setIsCalendarSynced(true);
    }
  }, [value, monthIsControlled]);

  // The grid has remounted and taken focus back (see `initialFocusedIndex`).
  useEffect(() => {
    if (isCalendarSynced) refocusAfterSync.current = false;
  }, [isCalendarSynced]);

  // Additional sync effect that runs when the component becomes ready
  useEffect(() => {
    if (isReady && value && !isCalendarSynced) {
      if (!monthIsControlled) {
        setCurrentMonth(value.getMonth());
        setCurrentYear(value.getFullYear());
      }
      setIsCalendarSynced(true);
    }
  }, [isReady, value, isCalendarSynced, monthIsControlled]);

  useEffect(() => {
    if (value === undefined && !hadValueRef.current) return;
    hadValueRef.current = true;
    setSelectedDate(value);
    if (value) {
      setSelectedTime({
        hours: value.getHours(),
        minutes: value.getMinutes(),
      });
      setIsPM(value.getHours() >= 12);

      // Update current month/year to match the selected date
      if (!monthIsControlled) {
        setCurrentMonth(value.getMonth());
        setCurrentYear(value.getFullYear());
      }
    }
  }, [value, monthIsControlled]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Focus goes into the grid only when the user is in the picker already,
   * never because it mounted or its month changed. A timer here used to
   * focus the selected day once the picker was ready and on every change
   * of month, wherever focus was: an inline DatePicker took focus from the
   * page as it loaded, from a field the user was typing in, and from the
   * month and year controls as they were used. (It also looked the day up
   * in whichever dropdown panel came first in the document.)
   *
   * Now focus moves in for `autoFocus`, once per opening: DateInput opens
   * the picker for a keyboard user, who is put on the selected day. Focus
   * that is already somewhere in the picker stays where the user put it.
   * The grid's other move, restoring focus to the picked day after a pick
   * from the keyboard remounts it, is ArrowNavigation's, and happens only
   * when focus was in the picker (see `initialFocusedIndex`).
   *
   * The panel a picker opens in is hidden until it has been positioned,
   * and a hidden button does not take focus, so this tries again until the
   * day has it, for up to half a second.
   */
  useEffect(() => {
    if (!autoFocus || open === false || !isReady) return;

    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const focusTheGrid = () => {
      if (rootRef.current?.contains(document.activeElement)) return;
      const day = gridRef.current?.querySelector<HTMLElement>(`${DAY_SELECTOR}[tabindex="0"]`);
      day?.focus({ preventScroll: true });
      if (document.activeElement !== day && ++tries < 10) {
        timer = setTimeout(focusTheGrid, 50);
      }
    };
    timer = setTimeout(focusTheGrid, 50);
    return () => clearTimeout(timer);
  }, [autoFocus, open, isReady]);

  /**
   * Whether the user is in this picker: focus is on one of its controls.
   * Read as the grid mounts, which it does again for each month and each
   * pick, to decide whether it may take focus (see `initialFocusedIndex`).
   */
  const focusIsInside = () =>
    typeof document !== "undefined" && !!rootRef.current?.contains(document.activeElement);

  const {
    months: monthNames,
    weekdays: dayNames,
    /** What the column headers are called: "Mo" is what fits, not what to read out. */
    weekdayLabels: dayLabels,
    firstDayOfWeek,
    monthYear,
    dayPeriods,
    time: formatTime,
  } = getCalendarNames(locale);
  const [amLabel, pmLabel] = [names.am ?? dayPeriods[0], names.pm ?? dayPeriods[1]];
  /** The weekday indexes (0 is Sunday) in the order the columns show them. */
  const weekOrder = Array.from({ length: 7 }, (_, column) => (column + firstDayOfWeek) % 7);
  const cellSize = size === "s" ? "32" : size === "m" ? "40" : "48";
  /** The grid's name: the month it shows, which tells two calendars side by side apart. */
  const gridLabel = monthYear(currentMonth, currentYear);

  const handleTimeToggle = (show: boolean) => {
    setIsTransitioning(false);
    setTimeout(() => {
      setIsTimeSelector(show);
      setIsTransitioning(true);
    }, 400);
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    if (timePicker && selectedDate && selectedTime) {
      newDate.setHours(selectedTime.hours);
      newDate.setMinutes(selectedTime.minutes);
    }
    setSelectedDate(newDate);
    if (timePicker) {
      handleTimeToggle(true);
    } else {
      onValueChange?.(newDate);
    }
  };

  const handleMonthChange = (increment: number) => {
    if (onMonthChange) {
      // Delegate to external handler
      onMonthChange(increment);
    } else {
      // Fallback to internal state management
      const newMonth = currentMonth + increment;
      if (newMonth < 0) {
        setCurrentMonth(11); // December
        setCurrentYear(currentYear - 1);
      } else if (newMonth > 11) {
        setCurrentMonth(0); // January
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(newMonth);
      }
    }
  };

  /**
   * Shows the month picked from the month or year list. A caller that owns
   * the month (`monthIsControlled`) is asked to move it, by the increment
   * its arrows ask for: setting it here moved this calendar alone, so a
   * dual DateRangePicker's two calendars came apart (or showed one month
   * twice), and the caller's next arrow jumped back from the month it
   * still had.
   */
  const showMonth = (year: number, monthIndex: number) => {
    if (monthIsControlled) {
      const increment = (year - currentYear) * 12 + (monthIndex - currentMonth);
      if (increment !== 0) onMonthChange?.(increment);
      return;
    }
    setCurrentMonth(monthIndex);
    setCurrentYear(year);
  };

  const handleMonthSelect = (monthIndex: number) => {
    showMonth(currentYear, monthIndex);
  };

  const handleYearSelect = (year: number) => {
    showMonth(year, currentMonth);
  };

  const generateYearOptions = () => {
    const currentYearNum = new Date().getFullYear();
    const minYear = minDate ? minDate.getFullYear() : currentYearNum - 25;
    const maxYear = maxDate ? maxDate.getFullYear() : currentYearNum + 25;

    const years = [];
    for (let i = minYear; i <= maxYear; i++) {
      years.push(i);
    }
    return years;
  };

  const isMonthDisabled = (monthIndex: number, year: number) => {
    if (!minDate && !maxDate) return false;

    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 0); // Last day of month

    // If the entire month is before the minimum date
    if (minDate && endOfMonth < minDate) return true;

    // If the entire month is after the maximum date
    if (maxDate && startOfMonth > maxDate) return true;

    return false;
  };

  const convert24to12 = (hour24: number) => {
    if (hour24 === 0) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };

  /**
   * `hours12` is the 1–12 value the hour input shows, NOT `selectedTime.hours`,
   * which is 24-hour. Passing the 24-hour value in re-applies the PM offset:
   * 15 becomes 27, the date rolls to the next day, and the hour input — capped
   * at 12 — starts showing 15. Every subsequent edit compounds it, which is
   * what made the field appear to flip between AM and PM while typing.
   */
  const handleTimeChange = (hours12: number, minutes: number, pm: boolean = isPM) => {
    if (!selectedDate) return;

    const newTime = {
      hours: pm ? (hours12 === 12 ? 12 : hours12 + 12) : hours12 === 12 ? 0 : hours12,
      minutes,
    };
    setSelectedTime(newTime);
    setIsPM(pm);

    const newDate = new Date(selectedDate);
    newDate.setHours(newTime.hours);
    newDate.setMinutes(minutes);
    onValueChange?.(newDate);
  };

  const isInRange = (date: Date) => {
    if (!range?.startDate) return false;
    if (!range?.endDate) return false;
    return date >= range.startDate && date <= range.endDate;
  };

  const isOutOfRange = (date: Date) =>
    (minDate !== undefined && date < minDate) || (maxDate !== undefined && date > maxDate);

  /**
   * The days of this month that can be picked: the buttons the arrow keys
   * move through, in order. `minDate` and `maxDate` bound one stretch of
   * days, so a week down is still 7 of them.
   */
  const pickableDays: number[] = [];
  for (let day = 1; day <= new Date(currentYear, currentMonth + 1, 0).getDate(); day++) {
    if (!isOutOfRange(new Date(currentYear, currentMonth, day))) pickableDays.push(day);
  }

  /** The day of `date` if this month shows it and it can be picked. */
  const pickableDayOf = (date: Date | null | undefined) =>
    date &&
    date.getMonth() === currentMonth &&
    date.getFullYear() === currentYear &&
    pickableDays.includes(date.getDate())
      ? date.getDate()
      : undefined;

  /**
   * The day the grid starts on, and the one day Tab reaches, so the grid is
   * a single tab stop the arrow keys move within: the selected day, else
   * the first day that can be picked. Once a day has had focus the tab stop
   * follows it, so Tab and Shift+Tab leave the grid from wherever the keys
   * took focus. Every day button used to be out of the tab order, so the
   * grid could not be reached by Tab at all; and the start was looked up
   * among the buttons of the whole document, so the second calendar of a
   * dual picker started from the first one's days.
   */
  const startDay = pickableDayOf(selectedDate) ?? pickableDays[0];
  const tabStopDay = pickableDayOf(focusedDate) ?? startDay;

  /**
   * The calendar as a grid: a header row of the day names, then one row per
   * week, each day a gridcell holding its button. The day buttons used to sit
   * straight in the `role="grid"` element with no rows or cells (axe
   * "aria-required-children"). Flex rows of fixed-width cells lay out exactly
   * as the CSS grid did, so nothing moves.
   */
  const renderCalendarGrid = () => {
    // The days before the 1st in its first week: the week starts on the
    // locale's first day (Monday in "de"), Sunday without a locale.
    const firstDay = (new Date(currentYear, currentMonth, 1).getDay() - firstDayOfWeek + 7) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Calculate total number of weeks needed
    const totalDaysShown = firstDay + daysInMonth;
    const numberOfWeeks = Math.ceil(totalDaysShown / 7);
    const totalGridSpots = numberOfWeeks * 7;

    const days = [];

    // Previous month's days
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay = daysInPrevMonth - firstDay + i + 1;
      days.push(
        <Flex
          role="gridcell"
          width={cellSize}
          height={cellSize}
          key={`prev-${currentYear}-${currentMonth}-${i}`}
        >
          <Button
            fillWidth
            weight="default"
            variant="tertiary"
            corners={
              firstDay === 1 ? undefined : i === 0 ? "left" : i === firstDay - 1 ? "right" : "none"
            }
            size={size}
            type="button"
            disabled
          >
            {prevMonthDay}
          </Button>
        </Flex>,
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date consistently - normalize to midnight in local timezone
      const currentDate = new Date(currentYear, currentMonth, day);
      const normalizedCurrentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );

      // A range's ends are selected in whichever calendar shows them: a
      // dual picker's second calendar has no value of its own until the
      // range ends in it, and its month no longer jumps to the first's.
      const isSelected =
        (selectedDate
          ? (selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth &&
              selectedDate.getFullYear() === currentYear) ||
            (value instanceof Date && value.getTime() === normalizedCurrentDate.getTime())
          : false) ||
        range?.startDate?.getTime() === normalizedCurrentDate.getTime() ||
        range?.endDate?.getTime() === normalizedCurrentDate.getTime();

      // Check if this date is being hovered
      const isHovered = hoveredDate
        ? hoveredDate.getDate() === day &&
          hoveredDate.getMonth() === currentMonth &&
          hoveredDate.getFullYear() === currentYear
        : false;

      const isFirstInRange =
        range?.startDate && currentDate.getTime() === range.startDate.getTime();
      const isLastInRange = range?.endDate && currentDate.getTime() === range.endDate.getTime();

      // Check if the current date is out of the minDate and maxDate range
      const isDisabled = (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate);

      // Calculate border radius for disabled days
      let disabledRadius: "left" | "right" | "none" | undefined = undefined;
      if (isDisabled) {
        // Find consecutive disabled days
        let consecutiveDisabledStart = day;
        let consecutiveDisabledEnd = day;

        // Look backwards for start of consecutive disabled days
        while (consecutiveDisabledStart > 1) {
          const prevDate = new Date(currentYear, currentMonth, consecutiveDisabledStart - 1);
          const isPrevDisabled = (minDate && prevDate < minDate) || (maxDate && prevDate > maxDate);
          if (isPrevDisabled) {
            consecutiveDisabledStart--;
          } else {
            break;
          }
        }

        // Look forwards for end of consecutive disabled days
        while (consecutiveDisabledEnd < daysInMonth) {
          const nextDate = new Date(currentYear, currentMonth, consecutiveDisabledEnd + 1);
          const isNextDisabled = (minDate && nextDate < minDate) || (maxDate && nextDate > maxDate);
          if (isNextDisabled) {
            consecutiveDisabledEnd++;
          } else {
            break;
          }
        }

        const totalConsecutiveDisabled = consecutiveDisabledEnd - consecutiveDisabledStart + 1;

        if (totalConsecutiveDisabled === 1) {
          disabledRadius = undefined;
        } else if (day === consecutiveDisabledStart) {
          disabledRadius = "left";
        } else if (day === consecutiveDisabledEnd) {
          disabledRadius = "right";
        } else {
          disabledRadius = "none";
        }
      }

      days.push(
        <Row
          key={`day-${currentYear}-${currentMonth}-${day}`}
          role="gridcell"
          aria-selected={isSelected}
          width={cellSize}
          height={cellSize}
          background={isInRange(currentDate) ? "neutral-alpha-weak" : undefined}
          borderTop={isInRange(currentDate) ? "neutral-alpha-weak" : "transparent"}
          borderBottom={isInRange(currentDate) ? "neutral-alpha-weak" : "transparent"}
          leftRadius={isFirstInRange ? "m" : undefined}
          rightRadius={isLastInRange ? "m" : undefined}
        >
          <Button
            fillWidth
            weight={isSelected ? "strong" : "default"}
            variant={isSelected ? "primary" : isHovered ? "secondary" : "tertiary"}
            corners={disabledRadius}
            tabIndex={day === tabStopDay ? 0 : -1}
            size={size}
            data-value={currentDate.toISOString()}
            onClick={(e: React.MouseEvent) => {
              if (!isDisabled) {
                if (timePicker) {
                  // Stop propagation to prevent Dropdown from closing
                  e.stopPropagation();
                }
                handleDateSelect(currentDate);
              }
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              onHover?.(currentDate);
              setHoveredDate(currentDate);
            }}
            onMouseLeave={() => {
              onHover?.(null);
              setHoveredDate(null);
            }}
            disabled={isDisabled}
          >
            {day}
          </Button>
        </Row>,
      );
    }

    const remainingDays = totalGridSpots - days.length;

    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <Row
          role="gridcell"
          marginTop="2"
          width={cellSize}
          height={cellSize}
          key={`next-${currentYear}-${currentMonth}-${i}`}
        >
          <Button
            fillWidth
            weight="default"
            variant="tertiary"
            corners={
              remainingDays === 1
                ? undefined
                : i === 1
                  ? "left"
                  : i === remainingDays
                    ? "right"
                    : "none"
            }
            size={size}
            type="button"
            disabled
          >
            {i}
          </Button>
        </Row>,
      );
    }

    const weeks = [];
    for (let start = 0; start < days.length; start += 7) {
      weeks.push(
        <Row key={`week-${currentYear}-${currentMonth}-${start / 7}`} role="row">
          {days.slice(start, start + 7)}
        </Row>,
      );
    }

    return (
      <Column
        fitWidth
        ref={gridRef}
        onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
          const value = event.target.getAttribute("data-value");
          if (value) setFocusedDate(new Date(value));
        }}
      >
        <Row role="row">
          {weekOrder.map((index) => (
            <Row
              key={dayLabels[index]}
              role="columnheader"
              aria-label={dayLabels[index]}
              width={cellSize}
              horizontal="center"
              marginBottom="16"
            >
              <Text textVariant="label-default-m" onBackground="neutral-medium" align="center">
                {dayNames[index]}
              </Text>
            </Row>
          ))}
        </Row>
        {weeks}
      </Column>
    );
  };

  return (
    <Column
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        // Close any open nested dropdowns when clicking on the DatePicker background
        if (isMonthOpen) {
          setIsMonthOpen(false);
        }
        if (isYearOpen) {
          setIsYearOpen(false);
        }
      }}
      ref={setRootRef}
      className={classNames(styles.calendar, className)}
      style={style}
      fillWidth
      horizontal="center"
      gap={size}
      {...rest}
    >
      <Flex fillWidth center>
        {isTimeSelector ? (
          <Column horizontal="center" fillWidth gap="8">
            <Text textVariant={`label-default-${size}`} onBackground="neutral-strong">
              {gridLabel}
            </Text>
            <Row
              paddingX="2"
              cursor="interactive"
              textVariant="label-default-s"
              radius="m"
              onBackground="brand-weak"
              tabIndex={0}
              onClick={() => handleTimeToggle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTimeToggle(false);
                }
              }}
              role="button"
            >
              {names.backToCalendar}
            </Row>
          </Column>
        ) : (
          <>
            {previousMonth && (
              <IconButton
                variant="tertiary"
                size={size}
                icon="chevronLeft"
                aria-label={names.previousMonth}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleMonthChange(-1);
                }}
              />
            )}
            <Column fillWidth horizontal="center" gap="8">
              <Row gap="4" horizontal="center">
                <Dropdown
                  nested={nested}
                  placement="bottom-start"
                  open={isMonthOpen}
                  dropdownId="month-dropdown"
                  onOpenChange={(open) => {
                    setIsMonthOpen(open);
                    // Update global tracking for keyboard navigation
                    if (open) {
                      // Set this as the last opened dropdown
                      setLastOpenedDropdown("month-dropdown");
                    } else if (getLastOpenedDropdown() === "month-dropdown") {
                      clearLastOpenedDropdown();
                    }
                  }}
                  trigger={
                    <Button
                      onClick={(event: React.MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        // Mutually exclusive, the way a native select is:
                        // these triggers stopPropagation, so the sibling's
                        // outside-click handler never fires and both panels
                        // would sit open over the calendar at once.
                        setIsYearOpen(false);
                        setIsMonthOpen(true);
                        setLastOpenedDropdown("month-dropdown");
                      }}
                      variant="secondary"
                      size="s"
                      // What the button is for, not only the month it shows.
                      aria-label={names.month(monthNames[currentMonth])}
                    >
                      <Row vertical="center" gap="4">
                        {monthNames[currentMonth]}
                        <Icon name="chevronDown" onBackground="neutral-weak" size="xs" />
                      </Row>
                    </Button>
                  }
                  data-dropdown-id="month-dropdown"
                >
                  <Column
                    fillWidth
                    gap="2"
                    padding="4"
                    onClick={(event: React.MouseEvent) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    {monthNames.map((month, index) => {
                      const monthDisabled = isMonthDisabled(index, currentYear);
                      return (
                        <Option
                          key={month}
                          value={index.toString()}
                          disabled={monthDisabled}
                          label={
                            <Text color={monthDisabled ? "neutral-weak" : undefined}>{month}</Text>
                          }
                          selected={index === currentMonth}
                          onClick={(value) => {
                            if (!monthDisabled) {
                              handleMonthSelect(index);
                              setIsMonthOpen(false);
                              clearLastOpenedDropdown();
                            }
                          }}
                        />
                      );
                    })}
                  </Column>
                </Dropdown>

                <Dropdown
                  nested={nested}
                  open={isYearOpen}
                  dropdownId="year-dropdown"
                  onOpenChange={(open) => {
                    setIsYearOpen(open);
                    // Update global tracking for keyboard navigation
                    if (open) {
                      setLastOpenedDropdown("year-dropdown");
                    } else if (getLastOpenedDropdown() === "year-dropdown") {
                      clearLastOpenedDropdown();
                    }
                  }}
                  placement="bottom-start"
                  trigger={
                    <Button
                      variant="secondary"
                      size="s"
                      aria-label={names.year(currentYear)}
                      onClick={(event: React.MouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        // See the month trigger: one at a time.
                        setIsMonthOpen(false);
                        setIsYearOpen(true);
                        setLastOpenedDropdown("year-dropdown");
                      }}
                    >
                      <Row vertical="center" gap="4">
                        {currentYear.toString()}
                        <Icon name="chevronDown" onBackground="neutral-weak" size="xs" />
                      </Row>
                    </Button>
                  }
                  data-dropdown-id="year-dropdown"
                >
                  <Column
                    fillWidth
                    padding="4"
                    gap="2"
                    overflowY="auto"
                    style={{ maxHeight: "16rem" }}
                    onClick={(event: React.MouseEvent) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    {generateYearOptions().map((year) => {
                      // Check if all months in this year are disabled
                      const allMonthsDisabled = Array.from({ length: 12 }, (_, i) => i).every(
                        (month) => isMonthDisabled(month, year),
                      );

                      return (
                        <Option
                          key={year}
                          value={year.toString()}
                          disabled={allMonthsDisabled}
                          label={
                            <Text color={allMonthsDisabled ? "neutral-weak" : undefined}>
                              {year}
                            </Text>
                          }
                          selected={year === currentYear}
                          onClick={(value) => {
                            if (!allMonthsDisabled) {
                              handleYearSelect(year);
                              setIsYearOpen(false);
                              clearLastOpenedDropdown();
                            }
                          }}
                        />
                      );
                    })}
                  </Column>
                </Dropdown>
              </Row>
              {timePicker && selectedTime && (
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  {formatTime(selectedTime.hours, selectedTime.minutes, [amLabel, pmLabel])}
                </Text>
              )}
            </Column>
            {nextMonth && (
              <IconButton
                variant="tertiary"
                size={size}
                icon="chevronRight"
                aria-label={names.nextMonth}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleMonthChange(1);
                }}
              />
            )}
          </>
        )}
      </Flex>

      <Reveal
        fillWidth
        center
        key={isTimeSelector ? "time" : "date"}
        revealed={isTransitioning}
        duration={250}
      >
        {isTimeSelector ? (
          <Column maxWidth="24rem" center padding="32" gap="32">
            <SegmentedControl
              buttons={[
                {
                  value: "AM",
                  label: amLabel,
                },
                {
                  value: "PM",
                  label: pmLabel,
                },
              ]}
              value={isPM ? "PM" : "AM"}
              onValueChange={(value) =>
                handleTimeChange(
                  convert24to12(selectedTime?.hours ?? 0),
                  selectedTime?.minutes ?? 0,
                  value === "PM",
                )
              }
            />
            <Flex fillWidth gap="16" vertical="center" data-scaling="110">
              <NumberInput
                id="hours"
                placeholder={names.hours}
                min={1}
                max={12}
                value={selectedTime?.hours ? convert24to12(selectedTime.hours) : 12}
                onValueChange={(value) => {
                  if (value >= 1 && value <= 12) {
                    handleTimeChange(value, selectedTime?.minutes ?? 0);
                  }
                }}
                aria-label={names.hours}
              />
              :
              <NumberInput
                id="minutes"
                placeholder={names.minutes}
                min={0}
                max={59}
                padStart={2}
                value={selectedTime?.minutes ?? 0}
                onValueChange={(value) => {
                  if (value >= 0 && value <= 59) {
                    handleTimeChange(convert24to12(selectedTime?.hours ?? 0), value);
                  }
                }}
                aria-label={names.minutes}
              />
            </Flex>
          </Column>
        ) : isMonthOpen || isYearOpen ? (
          // While a month or year list is open the arrow keys are that
          // list's, so the grid is drawn without ArrowNavigation.
          <Column role="grid" aria-label={gridLabel}>
            {renderCalendarGrid()}
          </Column>
        ) : (
          isCalendarSynced && (
            <ArrowNavigation
              layout="grid"
              columns={7}
              // The pickable days, not every day of the month: the keys
              // count enabled buttons, and End and the wrap ran past them.
              itemCount={pickableDays.length}
              // Read once, at mount, and a day only while the user is in
              // the picker. The grid mounts again for each month and each
              // pick, and ArrowNavigation focuses its starting day when
              // focus has fallen to the page, as it does when a pick from
              // the keyboard removes the focused day: that puts focus back
              // on the picked day. Anywhere else, the page loading or a
              // value set from outside, it took focus from the page. Where
              // the keys start is the day that has focus (FollowFocusedDay).
              initialFocusedIndex={
                (focusIsInside() || refocusAfterSync.current) && startDay !== undefined
                  ? pickableDays.indexOf(startDay)
                  : -1
              }
              wrap
              itemSelector={DAY_SELECTOR}
              role="grid"
              aria-label={gridLabel}
              key={`calendar-${currentYear}-${currentMonth}-${selectedDate?.getTime() || 0}`}
              disableHighlighting={true}
              // `autoFocus` is the effect above, once per opening: here it
              // focused a day each time the grid mounted, every month.
              autoFocus={false}
              onSelect={(index) => {
                // This grid's own button for that day: looked up in the
                // whole document, a dual picker's second calendar picked
                // the first one's day.
                gridRef.current?.querySelectorAll<HTMLButtonElement>(DAY_SELECTOR)[index]?.click();
              }}
            >
              {renderCalendarGrid()}
              <FollowFocusedDay gridRef={gridRef} />
            </ArrowNavigation>
          )
        )}
      </Reveal>
    </Column>
  );
};

Calendar.displayName = "Calendar";

/** One date, on one month's calendar (with `timePicker`, a date and time). */
interface SingleDatePickerProps extends Omit<CalendarProps, "highlight"> {
  /** Pick a `{ startDate, endDate }` range instead of one date. */
  range?: false;
}

/**
 * A range of dates (2.x's DateRangePicker): the first pick is the start, the
 * second the end, with a hover preview between them.
 */
interface RangeDatePickerProps
  extends Omit<
    React.ComponentProps<typeof Flex>,
    "onChange" | "defaultValue" | "value" | "onValueChange"
  > {
  range: true;
  /** The range, controlled. Leave it out to let the picker keep its own,
   *  starting from `defaultValue`. */
  value?: DateRange;
  /** The starting range of an uncontrolled range picker (no `value`). */
  defaultValue?: DateRange;
  /** Receives the range after each pick: the start alone, then both ends. */
  onValueChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  /** How many months show side by side: 1 (the default) or 2. 2.x's `dual` was `months={2}`. */
  months?: 1 | 2;
  size?: CondensedTShirtSizes;
  /**
   * Moves focus onto the first calendar's start day (else its first day that
   * can be picked) as it appears, as for a picker that has just been opened.
   */
  autoFocus?: boolean;
  /** The locale month and weekday names are shown in: see the single picker. */
  locale?: string;
  /** Every calendar's buttons and names, for a translated interface. */
  labels?: DatePickerLabels;
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

const RangeCalendars = ({
  ref,
  range: _range,
  value,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  size = "m",
  months = 1,
  autoFocus,
  locale,
  labels,
  ...rest
}: RangeDatePickerProps) => {
  const dual = months === 2;
  const initial = value ?? defaultValue;
  const [internalValue, setInternalValue] = useState<DateRange>({
    startDate: initial?.startDate || undefined,
    endDate: initial?.endDate || undefined,
  });

  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  // The first calendar starts on the range's start month, else this month.
  const [currentMonth, setCurrentMonth] = useState(
    initial?.startDate ? initial.startDate.getMonth() : new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    initial?.startDate ? initial.startDate.getFullYear() : new Date().getFullYear(),
  );

  useEffect(() => {
    if (value) {
      setInternalValue({ startDate: value.startDate, endDate: value.endDate });
      if (value.startDate) {
        setCurrentMonth(value.startDate.getMonth());
        setCurrentYear(value.startDate.getFullYear());
      }
    }
  }, [value]);

  const handleDateChange = (date: Date) => {
    if (!internalValue.startDate || (internalValue.startDate && internalValue.endDate)) {
      // A new selection starts.
      const newRange = { startDate: date, endDate: undefined };
      setInternalValue(newRange);
      onValueChange?.(newRange);
    } else {
      const newRange = { startDate: internalValue.startDate, endDate: date };
      if (newRange.startDate > date) {
        newRange.startDate = date;
        newRange.endDate = internalValue.startDate;
      }
      setInternalValue(newRange);
      onValueChange?.(newRange);
    }
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentYear, currentMonth + increment, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setInternalValue({ startDate: internalValue.startDate, endDate: internalValue.endDate });
  };

  const secondMonth = new Date(currentYear, currentMonth + 1, 1);

  const preview =
    !internalValue.startDate || internalValue.endDate || !hoveredDate
      ? null
      : {
          startDate: internalValue.startDate,
          endDate: hoveredDate > internalValue.startDate ? hoveredDate : internalValue.startDate,
        };

  return (
    <Flex ref={ref} gap="24" {...rest}>
      <Calendar
        value={internalValue.startDate}
        onValueChange={handleDateChange}
        highlight={preview || internalValue}
        minDate={minDate}
        maxDate={maxDate}
        size={size}
        nextMonth={!dual}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
        onHover={setHoveredDate}
        autoFocus={autoFocus}
        locale={locale}
        labels={labels}
      />
      {dual && (
        <Calendar
          value={internalValue.endDate}
          onValueChange={handleDateChange}
          highlight={preview || internalValue}
          minDate={minDate}
          maxDate={maxDate}
          previousMonth={false}
          size={size}
          currentMonth={secondMonth.getMonth()}
          currentYear={secondMonth.getFullYear()}
          onMonthChange={handleMonthChange}
          onHover={setHoveredDate}
          locale={locale}
          labels={labels}
        />
      )}
    </Flex>
  );
};

RangeCalendars.displayName = "RangeCalendars";

/**
 * A calendar for one date (and time, with `timePicker`), or with `range` a
 * `{ startDate, endDate }` range over one or two months (`months`).
 */
const DatePicker = ({ ref, ...props }: DatePickerProps) =>
  props.range ? (
    <RangeCalendars {...props} ref={ref} />
  ) : (
    <Calendar {...(({ range: _range, ...rest }) => rest)(props)} ref={ref} />
  );

DatePicker.displayName = "DatePicker";

export type { DatePickerProps };
export { DatePicker };

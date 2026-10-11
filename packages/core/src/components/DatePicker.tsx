"use client";

import classNames from "clsx";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { CondensedTShirtSizes } from "../types";
import {
  clearLastOpenedDropdown,
  getLastOpenedDropdown,
  setLastOpenedDropdown,
} from "../utils/dropdownState";
import { ArrowNavigation, useArrowNavigationContext } from "./ArrowNavigationContext";
import { Button } from "./Button";
import { Column } from "./Column";
import styles from "./DatePicker.module.scss";
import { DropdownWrapper } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { NumberInput } from "./NumberInput";
import { Option } from "./Option";
import { RevealFx } from "./RevealFx";
import { Row } from "./Row";
import { SegmentedControl } from "./SegmentedControl";
import { Text } from "./Text";

export interface DatePickerProps extends Omit<React.ComponentProps<typeof Flex>, "onChange"> {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  previousMonth?: boolean;
  nextMonth?: boolean;
  timePicker?: boolean;
  defaultDate?: Date;
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
  range?: {
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
    const follow = (event: FocusEvent) => {
      const index = Array.from(grid.querySelectorAll(DAY_SELECTOR)).indexOf(
        event.target as Element,
      );
      if (index >= 0) setFocusedIndex(index);
    };
    grid.addEventListener("focusin", follow);
    return () => grid.removeEventListener("focusin", follow);
  }, [gridRef, setFocusedIndex]);
  return null;
};

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      timePicker = false,
      previousMonth = true,
      nextMonth = true,
      minDate,
      maxDate,
      defaultDate,
      defaultTime,
      size = "m",
      nested = false,
      className,
      style,
      currentMonth: propCurrentMonth,
      currentYear: propCurrentYear,
      onMonthChange,
      range,
      onHover,
      autoFocus = false,
      open,
      ...rest
    },
    ref,
  ) => {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
    const [selectedTime, setSelectedTime] = useState<
      | {
          hours: number;
          minutes: number;
        }
      | undefined
    >(defaultTime);
    const [isPM, setIsPM] = useState(defaultTime?.hours ? defaultTime.hours >= 12 : false);
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
      propCurrentMonth !== undefined &&
      propCurrentYear !== undefined &&
      onMonthChange !== undefined;

    const [currentMonth, setCurrentMonth] = useState<number>(() =>
      monthIsControlled && propCurrentMonth !== undefined
        ? propCurrentMonth
        : (value ?? today).getMonth(),
    );
    const [currentYear, setCurrentYear] = useState<number>(() =>
      monthIsControlled && propCurrentYear !== undefined
        ? propCurrentYear
        : (value ?? today).getFullYear(),
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

    // Sync currentMonth/currentYear to value on mount and when value changes
    useEffect(() => {
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

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    /** What the column headers are called: "Mo" is what fits, not what to read out. */
    const dayLabels = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const cellSize = size === "s" ? "32" : size === "m" ? "40" : "48";
    /** The grid's name: the month it shows, which tells two calendars side by side apart. */
    const gridLabel = `${monthNames[currentMonth]} ${currentYear}`;

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
        onChange?.(newDate);
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

    const handleMonthSelect = (monthIndex: number) => {
      setCurrentMonth(monthIndex);
    };

    const handleYearSelect = (year: number) => {
      setCurrentYear(year);
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
      onChange?.(newDate);
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
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
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
                firstDay === 1
                  ? undefined
                  : i === 0
                    ? "left"
                    : i === firstDay - 1
                      ? "right"
                      : "none"
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
            const isPrevDisabled =
              (minDate && prevDate < minDate) || (maxDate && prevDate > maxDate);
            if (isPrevDisabled) {
              consecutiveDisabledStart--;
            } else {
              break;
            }
          }

          // Look forwards for end of consecutive disabled days
          while (consecutiveDisabledEnd < daysInMonth) {
            const nextDate = new Date(currentYear, currentMonth, consecutiveDisabledEnd + 1);
            const isNextDisabled =
              (minDate && nextDate < minDate) || (maxDate && nextDate > maxDate);
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
                    // Stop propagation to prevent DropdownWrapper from closing
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
            {dayNames.map((day, index) => (
              <Row
                key={day}
                role="columnheader"
                aria-label={dayLabels[index]}
                width={cellSize}
                horizontal="center"
                marginBottom="16"
              >
                <Text variant="label-default-m" onBackground="neutral-medium" align="center">
                  {day}
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
              <Text variant={`label-default-${size}`} onBackground="neutral-strong">
                {monthNames[currentMonth]} {currentYear}
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
                aria-label="Back to calendar"
              >
                Back to calendar
              </Row>
            </Column>
          ) : (
            <>
              {previousMonth && (
                <IconButton
                  variant="tertiary"
                  size={size}
                  icon="chevronLeft"
                  aria-label="Previous month"
                  onClick={(event: React.MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleMonthChange(-1);
                  }}
                />
              )}
              <Column fillWidth horizontal="center" gap="8">
                <Row gap="4" horizontal="center">
                  <DropdownWrapper
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
                      >
                        <Row vertical="center" gap="4">
                          {monthNames[currentMonth]}
                          <Icon name="chevronDown" onBackground="neutral-weak" size="xs" />
                        </Row>
                      </Button>
                    }
                    dropdown={
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
                                <Text color={monthDisabled ? "neutral-weak" : undefined}>
                                  {month}
                                </Text>
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
                    }
                    data-dropdown-id="month-dropdown"
                  />

                  <DropdownWrapper
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
                    dropdown={
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
                    }
                    data-dropdown-id="year-dropdown"
                  />
                </Row>
                {timePicker && selectedTime && (
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {`${convert24to12(selectedTime.hours).toString().padStart(2, "0")}:${selectedTime.minutes.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`}
                  </Text>
                )}
              </Column>
              {nextMonth && (
                <IconButton
                  variant="tertiary"
                  size={size}
                  icon="chevronRight"
                  aria-label="Next month"
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

        <RevealFx
          fillWidth
          center
          key={isTimeSelector ? "time" : "date"}
          revealed={isTransitioning}
          speed={250}
        >
          {isTimeSelector ? (
            <Column maxWidth={24} center padding="32" gap="32">
              <SegmentedControl
                buttons={[
                  {
                    value: "AM",
                    label: "AM",
                  },
                  {
                    value: "PM",
                    label: "PM",
                  },
                ]}
                value={isPM ? "PM" : "AM"}
                onChange={(value) =>
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
                  placeholder="Hours"
                  min={1}
                  max={12}
                  value={selectedTime?.hours ? convert24to12(selectedTime.hours) : 12}
                  onChange={(value) => {
                    if (value >= 1 && value <= 12) {
                      handleTimeChange(value, selectedTime?.minutes ?? 0);
                    }
                  }}
                  aria-label="Hours"
                />
                :
                <NumberInput
                  id="minutes"
                  placeholder="Minutes"
                  min={0}
                  max={59}
                  padStart={2}
                  value={selectedTime?.minutes ?? 0}
                  onChange={(value) => {
                    if (value >= 0 && value <= 59) {
                      handleTimeChange(convert24to12(selectedTime?.hours ?? 0), value);
                    }
                  }}
                  aria-label="Minutes"
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
                  focusIsInside() && startDay !== undefined ? pickableDays.indexOf(startDay) : -1
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
                  gridRef.current
                    ?.querySelectorAll<HTMLButtonElement>(DAY_SELECTOR)
                    [index]?.click();
                }}
              >
                {renderCalendarGrid()}
                <FollowFocusedDay gridRef={gridRef} />
              </ArrowNavigation>
            )
          )}
        </RevealFx>
      </Column>
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };

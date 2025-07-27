"use client";

import React, { useState, forwardRef, useEffect } from "react";
import classNames from "classnames";
import { ClickAway, Flex, Text, Button, Grid, SegmentedControl, IconButton, RevealFx, NumberInput, DropdownWrapper, Option, Column, Icon, Row, ArrowNavigation } from ".";
import styles from "./DatePicker.module.scss";

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
  size?: "s" | "m" | "l";
  isNested?: boolean;
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
}

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
      isNested = false,
      className,
      style,
      currentMonth: propCurrentMonth,
      currentYear: propCurrentYear,
      onMonthChange,
      range,
      onHover,
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

    const [currentMonth, setCurrentMonth] = useState<number>(value ? value.getMonth() : today.getMonth());
    const [currentYear, setCurrentYear] = useState<number>(value ? value.getFullYear() : today.getFullYear());

    useEffect(() => {
      if (typeof propCurrentMonth === "number") {
        setCurrentMonth(propCurrentMonth);
      }
      if (typeof propCurrentYear === "number") {
        setCurrentYear(propCurrentYear);
      }
    }, [propCurrentMonth, propCurrentYear]);

    useEffect(() => {
      setSelectedDate(value);
      if (value) {
        setSelectedTime({
          hours: value.getHours(),
          minutes: value.getMinutes(),
        });
        setIsPM(value.getHours() >= 12);
      }
    }, [value]);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 100);

      return () => clearTimeout(timer);
    }, []);

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
      const minYear = minDate ? minDate.getFullYear() : currentYearNum - 10;
      const maxYear = maxDate ? maxDate.getFullYear() : currentYearNum + 10;
      
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

    const handleTimeChange = (hours: number, minutes: number, pm: boolean = isPM) => {
      if (!selectedDate) return;

      const newTime = {
        hours: pm ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours,
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
            width={size === "s" ? "32" : size === "m" ? "40" : "48"}
            height={size === "s" ? "32" : size === "m" ? "40" : "48"}
            key={`prev-${currentYear}-${currentMonth}-${i}`}
          >
            <Button
              fillWidth
              weight="default"
              variant="tertiary"
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
        const currentDate = new Date(currentYear, currentMonth, day);
        const isSelected =
          (selectedDate?.getDate() === day &&
            selectedDate?.getMonth() === currentMonth &&
            selectedDate?.getFullYear() === currentYear) ||
          (value instanceof Date && value.getTime() === currentDate.getTime()) ||
          range?.startDate?.getTime() === currentDate.getTime() ||
          range?.endDate?.getTime() === currentDate.getTime();

        const isFirstInRange =
          range?.startDate && currentDate.getTime() === range.startDate.getTime();
        const isLastInRange = range?.endDate && currentDate.getTime() === range.endDate.getTime();

        // Check if the current date is out of the minDate and maxDate range
        const isDisabled = (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate);

        days.push(
          <Row
            key={`day-${currentYear}-${currentMonth}-${day}`}
            width={size === "s" ? "32" : size === "m" ? "40" : "48"}
            height={size === "s" ? "32" : size === "m" ? "40" : "48"}
            background={isInRange(currentDate) ? "neutral-alpha-weak" : undefined}
            borderTop={isInRange(currentDate) ? "neutral-alpha-weak" : "transparent"}
            borderBottom={isInRange(currentDate) ? "neutral-alpha-weak" : "transparent"}
            leftRadius={isFirstInRange ? "m" : undefined}
            rightRadius={isLastInRange ? "m" : undefined}
          >
            <Button
              fillWidth
              weight={isSelected ? "strong" : "default"}
              variant={isSelected ? "primary" : "tertiary"}
              tabIndex={-1}
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
              onMouseEnter={() => onHover?.(currentDate)}
              onMouseLeave={() => onHover?.(null)}
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
            marginTop="2"
            width={size === "s" ? "32" : size === "m" ? "40" : "48"}
            height={size === "s" ? "32" : size === "m" ? "40" : "48"}
            key={`next-${currentYear}-${currentMonth}-${i}`}
          >
            <Button
              fillWidth
              weight="default"
              variant="tertiary"
              size={size}
              type="button"
              disabled
            >
              {i}
            </Button>
          </Row>,
        );
      }

      return days;
    };

    return (
      <Column
        onClick={(event: any) => {
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
        ref={ref}
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
              <Text
                className="cursor-interactive"
                variant="label-default-s"
                onBackground="brand-weak"
                onClick={() => handleTimeToggle(false)}
              >
                Back to calendar
              </Text>
            </Column>
          ) : (
            <>
              {previousMonth && (
                <IconButton
                  variant="tertiary"
                  size={size}
                  icon="chevronLeft"
                  onClick={(event: any) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleMonthChange(-1);
                  }}
                />
              )}
              <Column fillWidth horizontal="center" gap="8">
                <Row gap="4" horizontal="center">
                  <DropdownWrapper
                    isNested={isNested}
                    placement="bottom-start"
                    isOpen={isMonthOpen}
                    dropdownId="month-dropdown"
                    onOpenChange={(open) => {
                      setIsMonthOpen(open);
                      // Update global tracking for keyboard navigation
                      if (open) {
                        // Set this as the last opened dropdown
                        (window as any).lastOpenedDropdown = 'month-dropdown';
                        console.log('Month dropdown opened');
                      } else if ((window as any).lastOpenedDropdown === 'month-dropdown') {
                        (window as any).lastOpenedDropdown = null;
                        console.log('Month dropdown closed');
                      }
                    }}
                    trigger={
                      <Button
                        onClick={(event: any) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setIsMonthOpen(true);
                          // Update global tracking
                          (window as any).lastOpenedDropdown = 'month-dropdown';
                          console.log('Month dropdown opened via trigger');
                        }}
                        variant="secondary"
                        size="s"
                      >
                        <Row vertical="center" gap="4">
                          {monthNames[currentMonth]}
                          <Icon name="chevronDown" onBackground="neutral-weak" size="xs"/>
                        </Row>
                      </Button>
                    }
                    dropdown={
                      <Column fillWidth gap="2" padding="4"
                        onClick={(event: any) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}>
                        {monthNames.map((month, index) => {
                          const monthDisabled = isMonthDisabled(index, currentYear);
                          return (
                            <Option
                              key={month}
                              value={index.toString()}
                              disabled={monthDisabled}
                              label={<Text color={monthDisabled ? "neutral-weak" : undefined}>{month}</Text>}
                              selected={index === currentMonth}
                              onClick={(value) => {
                                if (!monthDisabled) {
                                  handleMonthSelect(index);
                                  setIsMonthOpen(false);
                                  // Clear global tracking
                                  (window as any).lastOpenedDropdown = null;
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
                    navigationLayout="grid"
                    optionsCount={generateYearOptions().length}
                    columns={generateYearOptions().length < 6 ? 1 : 6}
                    isNested={isNested}
                    isOpen={isYearOpen}
                    dropdownId="year-dropdown"
                    onOpenChange={(open) => {
                      setIsYearOpen(open);
                      // Update global tracking for keyboard navigation
                      if (open) {
                        // Set this as the last opened dropdown
                        (window as any).lastOpenedDropdown = 'year-dropdown';
                        console.log('Year dropdown opened');
                      } else if ((window as any).lastOpenedDropdown === 'year-dropdown') {
                        (window as any).lastOpenedDropdown = null;
                        console.log('Year dropdown closed');
                      }
                    }}
                    placement="bottom-start"
                    trigger={
                      <Button
                        variant="secondary"
                        size="s"
                        onClick={(event: any) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setIsYearOpen(true);
                          // Update global tracking
                          (window as any).lastOpenedDropdown = 'year-dropdown';
                          console.log('Year dropdown opened via trigger');
                        }}
                      >
                        <Row vertical="center" gap="4">
                          {currentYear.toString()}
                          <Icon name="chevronDown" onBackground="neutral-weak" size="xs"/>
                        </Row>
                      </Button>
                    }
                    dropdown={
                      <Grid columns={generateYearOptions().length < 6 ? "1" : 6}
                        gap="2" padding="4"
                        onClick={(event: any) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        {generateYearOptions().map((year) => {
                          // Check if all months in this year are disabled
                          const allMonthsDisabled = Array.from({ length: 12 }, (_, i) => i)
                            .every(month => isMonthDisabled(month, year));
                            
                          return (
                            <Option
                              key={year}
                              value={year.toString()}
                              disabled={allMonthsDisabled}
                              label={<Text color={allMonthsDisabled ? "neutral-weak" : undefined}>{year}</Text>}
                              selected={year === currentYear}
                              onClick={(value) => {
                                if (!allMonthsDisabled) {
                                  handleYearSelect(year);
                                  setIsYearOpen(false);
                                  // Clear global tracking
                                  (window as any).lastOpenedDropdown = null;
                                }
                              }}
                            />
                          );
                        })}
                      </Grid>
                    }
                    data-dropdown-id="year-dropdown"
                  />
                </Row>
                {timePicker && selectedTime && (
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {`${selectedTime.hours.toString().padStart(2, "0")}:${selectedTime.minutes.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`}
                  </Text>
                )}
              </Column>
              {nextMonth &&  (
                <IconButton
                  variant="tertiary"
                  size={size}
                  icon="chevronRight"
                  onClick={(event: any) => {
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
          trigger={isTransitioning}
          speed="fast"
        >
          {isTimeSelector ? (
            <Column
              maxWidth={24}
              center
              padding="32"
              gap="32"
            >
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
                selected={isPM ? "PM" : "AM"}
                onToggle={(value) =>
                  handleTimeChange(
                    selectedTime?.hours ?? 0,
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
                      handleTimeChange(selectedTime?.hours ?? 0, value);
                    }
                  }}
                  aria-label="Minutes"
                />
              </Flex>
            </Column>
          ) : (
            isMonthOpen || isYearOpen ? (
              <Grid fitWidth columns="7" gap="2">
                {dayNames.map((day) => (
                  <Text
                    marginBottom="16"
                    key={day}
                    variant="label-default-m"
                    onBackground="neutral-medium"
                    align="center"
                  >
                    {day}
                  </Text>
                ))}
                {renderCalendarGrid()}
              </Grid>
            ) : (
              <ArrowNavigation
                layout="grid"
                columns={7}
                itemCount={7 * Math.ceil((new Date(currentYear, currentMonth + 1, 0).getDate() + new Date(currentYear, currentMonth, 1).getDay()) / 7)}
                wrap
                itemSelector='button:not([disabled])'
                role="grid"
                aria-label="Calendar"
              >
                <Grid fitWidth columns="7" gap="2">
                  {dayNames.map((day) => (
                    <Text
                      marginBottom="16"
                      key={day}
                      variant="label-default-m"
                      onBackground="neutral-medium"
                      align="center"
                    >
                      {day}
                    </Text>
                  ))}
                  {renderCalendarGrid()}
                </Grid>
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

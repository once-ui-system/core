import { useEffect, useState } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { fieldLocale, getCalendarNames } from "./calendarLocale";
import { Dialog } from "./Dialog";
import { Column, type FlexProps, Row } from "./Flex";
import { FormCellContext } from "./FormContext";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";
import { Text } from "./Text";

export interface DatePickerLabels {
  /** Defaults to `"Previous month"`. */
  previousMonth?: string;
  /** Defaults to `"Next month"`. */
  nextMonth?: string;
}

export interface DatePickerProps extends Omit<FlexProps, "children"> {
  value?: Date;
  /** The starting date when there is no `value`. */
  defaultDate?: Date;
  onChange?: (date: Date) => void;
  /** Core 3.0's name for `onChange`; both are called. */
  onValueChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  /** Day cells of 32, 40 or 48, as in core. */
  size?: "s" | "m" | "l";
  /** Highlights the days from `startDate` to `endDate`, as core's range pickers do. */
  range?: { startDate?: Date; endDate?: Date };
  /** Month and weekday names, and the week's first day, in a BCP 47 locale such as "hu". */
  locale?: string;
  labels?: DatePickerLabels;
}

const sameDay = (a?: Date, b?: Date) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** The days a month grid shows: leading days of the last month, the month, then the next. */
export function monthGrid(year: number, month: number, firstDayOfWeek: number) {
  const lead = (new Date(year, month, 1).getDay() - firstDayOfWeek + 7) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((lead + days) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(year, month, i - lead + 1));
}

/**
 * Core's `DatePicker`: a month of days to pick one from, with the month's
 * name between previous and next buttons. Days outside `minDate`…`maxDate`
 * can't be picked. Names follow `locale`, as on the web.
 */
export function DatePicker({
  value,
  defaultDate,
  onChange,
  onValueChange,
  minDate,
  maxDate,
  size = "m",
  range,
  locale,
  labels,
  ...column
}: DatePickerProps) {
  const theme = useTheme();
  const names = getCalendarNames(locale);
  const [own, setOwn] = useState<Date | undefined>(defaultDate);
  const selected = value ?? own;
  const start = selected ?? range?.startDate ?? new Date();
  const [shown, setShown] = useState({ year: start.getFullYear(), month: start.getMonth() });

  // A new `value` from outside shows its month.
  useEffect(() => {
    if (value) setShown({ year: value.getFullYear(), month: value.getMonth() });
  }, [value]);

  const cell = theme.space(size === "s" ? "32" : size === "m" ? "40" : "48");
  const order = Array.from({ length: 7 }, (_, i) => (i + names.firstDayOfWeek) % 7);
  const days = monthGrid(shown.year, shown.month, names.firstDayOfWeek);
  const today = new Date();
  const move = (step: number) =>
    setShown(({ year, month }) => {
      const next = new Date(year, month + step, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  const from = range?.startDate ? dayStart(range.startDate) : undefined;
  const to = range?.endDate ? dayStart(range.endDate) : undefined;
  const pick = (day: Date) => {
    // Keeps the time of day already chosen, as core does.
    const next = new Date(day);
    if (selected) next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    if (value === undefined) setOwn(next);
    onChange?.(next);
    onValueChange?.(next);
  };

  return (
    <Column gap="8" {...column}>
      <Row vertical="center" horizontal="between" gap="8">
        <IconButton
          icon="chevronLeft"
          variant="tertiary"
          size="m"
          ariaLabel={labels?.previousMonth ?? "Previous month"}
          onPress={() => move(-1)}
        />
        <Text variant="label-strong-m" accessibilityRole="header" accessibilityLiveRegion="polite">
          {names.monthYear(shown.month, shown.year)}
        </Text>
        <IconButton
          icon="chevronRight"
          variant="tertiary"
          size="m"
          ariaLabel={labels?.nextMonth ?? "Next month"}
          onPress={() => move(1)}
        />
      </Row>
      <Row horizontal="between">
        {order.map((d) => (
          <View key={d} style={{ width: cell, alignItems: "center" }}>
            <Text
              variant="label-default-s"
              onBackground="neutral-weak"
              accessibilityLabel={names.weekdayLabels[d]}
            >
              {names.weekdays[d]}
            </Text>
          </View>
        ))}
      </Row>
      <Column gap="2">
        {Array.from({ length: days.length / 7 }, (_, week) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: weeks are positional
          <Row key={week} horizontal="between">
            {days.slice(week * 7, week * 7 + 7).map((day) => {
              const time = dayStart(day);
              const outside = day.getMonth() !== shown.month;
              const blocked =
                (minDate && time < dayStart(minDate)) || (maxDate && time > dayStart(maxDate));
              const isSelected =
                sameDay(day, selected) ||
                (from !== undefined && time === from) ||
                (to !== undefined && time === to);
              const inRange = from !== undefined && to !== undefined && time > from && time < to;
              const isToday = sameDay(day, today);
              const style: ViewStyle = {
                width: cell,
                height: cell,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius("m"),
                borderWidth: 1,
                borderColor:
                  isToday && !isSelected ? theme.color("neutral-border-strong") : "transparent",
                backgroundColor: isSelected
                  ? theme.color("brand-solid-strong")
                  : inRange
                    ? theme.color("brand-alpha-weak")
                    : "transparent",
              };
              return (
                <Pressable
                  key={time}
                  accessibilityRole="button"
                  accessibilityLabel={day.toLocaleDateString(fieldLocale(locale), {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  aria-selected={isSelected}
                  aria-disabled={!!blocked}
                  disabled={!!blocked}
                  onPress={() => pick(day)}
                  style={({ pressed }) => [
                    style,
                    pressed && !isSelected
                      ? { backgroundColor: theme.color("neutral-alpha-weak") }
                      : {},
                  ]}
                >
                  <Text
                    variant={isSelected ? "label-strong-s" : "label-default-s"}
                    onBackground={blocked || outside ? "neutral-weak" : "neutral-strong"}
                    onSolid={isSelected ? "brand-strong" : undefined}
                    style={
                      blocked
                        ? { opacity: 0.4 }
                        : outside && !isSelected
                          ? { opacity: 0.6 }
                          : undefined
                    }
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </Row>
        ))}
      </Column>
    </Column>
  );
}

export interface DateInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "onChangeText"> {
  /** Core's id. Kept so web code compiles; not used on native. */
  id?: string;
  value?: Date;
  /** The starting date when there is no `value`. */
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Core 3.0's name for `onChange`; both are called. */
  onValueChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  /** The field's date and the calendar's names, in a BCP 47 locale such as "hu". */
  locale?: string;
  labels?: DatePickerLabels;
  /** Open state, when you own it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Core's `DateInput`: an `Input`-styled field showing the date, that opens a
 * `DatePicker` in a bottom sheet. Picking a day closes the sheet.
 */
export function DateInput({
  id: _id,
  value,
  defaultValue,
  onChange,
  onValueChange,
  minDate,
  maxDate,
  locale,
  labels,
  open,
  defaultOpen = false,
  onOpenChange,
  label,
  placeholder,
  disabled,
  style,
  ...input
}: DateInputProps) {
  const [own, setOwn] = useState(defaultValue);
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const date = value ?? own;
  const isOpen = open ?? ownOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };
  const shown = date
    ? date.toLocaleDateString(fieldLocale(locale), {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
  return (
    <View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: shown || placeholder }}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <View pointerEvents="none">
          <Input
            label={label}
            placeholder={placeholder}
            value={shown}
            disabled={disabled}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            suffix={<Icon name="calendar" size="s" onBackground="neutral-medium" />}
            {...input}
          />
        </View>
      </Pressable>
      {/* The sheet is not the form's field: nothing in it takes the stacked corners. */}
      <FormCellContext.Provider value={null}>
        <Dialog open={isOpen} onClose={() => setOpen(false)} title={label}>
          <DatePicker
            value={date}
            minDate={minDate}
            maxDate={maxDate}
            locale={locale}
            labels={labels}
            onChange={(next) => {
              if (value === undefined) setOwn(next);
              onChange?.(next);
              onValueChange?.(next);
              setOpen(false);
            }}
          />
        </Dialog>
      </FormCellContext.Provider>
    </View>
  );
}

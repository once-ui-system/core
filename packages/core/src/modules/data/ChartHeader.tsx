"use client";

import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import React, { useEffect, useState } from "react";
import { Column } from "../../components/Column";
import { DateRange, DateRangePicker } from "../../components/DateRangePicker";
import { Dropdown } from "../../components/Dropdown";
import { IconButton } from "../../components/IconButton";
import { Row } from "../../components/Row";
import { Text } from "../../components/Text";
import { ToggleButton } from "../../components/ToggleButton";
import { DateConfig, PresetsConfig } from "./interfaces";

interface ChartHeaderProps
  extends Omit<React.ComponentProps<typeof Column>, "title" | "description"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  dateRange?: DateRange;
  date?: DateConfig;
  onDateRangeChange?: (range: DateRange) => void;
  presets?: PresetsConfig;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  title,
  description,
  dateRange,
  date,
  onDateRangeChange,
  presets = { display: true, granularity: "week" },
  ...flex
}) => {
  // Hooks first, the empty check after them: returning before a hook drops the
  // hook state whenever the header goes empty, including the cleanup of the
  // Escape listener below, which then stays on `document`.
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  type DateRangePreset = {
    getRange: () => DateRange;
  };

  type PresetName =
    | "This year"
    | "This month"
    | "This week"
    | "Last year"
    | "Last month"
    | "Last week";

  const dateRangePresets: Record<PresetName, DateRangePreset> = {
    "This year": {
      getRange: () => ({
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      }),
    },
    "This month": {
      getRange: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    "This week": {
      getRange: () => ({
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
      }),
    },
    "Last year": {
      getRange: () => {
        const lastYear = subYears(new Date(), 1);
        return {
          startDate: startOfYear(lastYear),
          endDate: endOfYear(lastYear),
        };
      },
    },
    "Last month": {
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
      },
    },
    "Last week": {
      getRange: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          startDate: startOfWeek(lastWeek),
          endDate: endOfWeek(lastWeek),
        };
      },
    },
  };

  useEffect(() => {
    if (dateRange) {
      const matchingPreset = Object.entries(dateRangePresets).find(([name, preset]) => {
        const presetRange = preset.getRange();
        return (
          dateRange.startDate &&
          presetRange.startDate &&
          isSameDay(dateRange.startDate, presetRange.startDate) &&
          dateRange.endDate &&
          presetRange.endDate &&
          isSameDay(dateRange.endDate, presetRange.endDate)
        );
      });

      setSelectedPreset(matchingPreset ? matchingPreset[0] : null);
    } else {
      setSelectedPreset(null);
    }
  }, [dateRange]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dateRangeOpen) {
        setDateRangeOpen(false);
      }
    };

    if (dateRangeOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [dateRangeOpen]);

  const handleDateRangeChange = (newRange: DateRange) => {
    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    }
  };

  const handlePresetClick = (presetName: PresetName) => {
    const newRange = dateRangePresets[presetName].getRange();
    setSelectedPreset(presetName);
    handleDateRangeChange(newRange);
  };

  if (!title && !description && !date?.selector) {
    return null;
  }

  return (
    <Column fillWidth paddingX="20" paddingY="12" gap="4" {...flex}>
      <Row fillWidth vertical="center">
        <Column fillWidth gap="4">
          {title && <Text textVariant="heading-strong-xs">{title}</Text>}
          {description && (
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {description}
            </Text>
          )}
        </Column>
        {dateRange && date?.selector && (
          <Dropdown
            open={dateRangeOpen}
            onOpenChange={(isOpen) => setDateRangeOpen(isOpen)}
            placement="bottom-end"
            trigger={
              <IconButton
                icon="calendar"
                aria-label="Choose a date range"
                onClick={() => setDateRangeOpen(!dateRangeOpen)}
                variant="secondary"
                size="m"
              />
            }
          >
            <Row padding="4" s={{ direction: "column" }}>
              {presets.display && (
                <Column
                  s={{ direction: "row" }}
                  padding="4"
                  gap="2"
                  minWidth="8rem"
                  border
                  radius="m"
                  overflowX="scroll"
                >
                  {(Object.keys(dateRangePresets) as PresetName[])
                    .filter((presetName) => {
                      if (presets.granularity === "year") {
                        return presetName.includes("year");
                      } else if (presets.granularity === "month") {
                        return presetName.includes("year") || presetName.includes("month");
                      } else {
                        return true;
                      }
                    })
                    .map((presetName) => (
                      <ToggleButton
                        key={presetName}
                        style={{ paddingLeft: "0.25rem" }}
                        fillWidth
                        horizontal="start"
                        selected={selectedPreset === presetName}
                        onClick={() => handlePresetClick(presetName)}
                      >
                        {presetName}
                      </ToggleButton>
                    ))}
                </Column>
              )}
              <DateRangePicker
                size="s"
                padding="16"
                gap="24"
                id="chart-date-range"
                maxDate={date?.max}
                minDate={date?.min}
                dual={date?.dual}
                value={dateRange}
                onValueChange={handleDateRangeChange}
              />
            </Row>
          </Dropdown>
        )}
      </Row>
    </Column>
  );
};

export type { ChartHeaderProps };

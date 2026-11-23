import type { DateConfig } from "../interfaces.js";
import { formatChartDate, toChartDate } from "./chartDate.js";

/**
 * Formats a value as a date if it's a valid date and a format is provided
 * Otherwise returns the original value or label if available
 *
 * @param value - The value to format (could be a date, string, or any other value)
 * @param dateConfig - Optional date configuration with format string
 * @param dataPoint - Optional data point object that might contain a label property
 * @returns Formatted date string or original value
 */
export function formatDate(
  value: any,
  dateConfig?: DateConfig,
  dataPoint?: Record<string, any>,
): string {
  if (dataPoint?.label) {
    return dataPoint.label;
  }

  if (dateConfig?.format) {
    try {
      // A Date, or an ISO date string
      if (
        value instanceof Date ||
        (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))
      ) {
        const date = toChartDate(value);
        if (date) return formatChartDate(date, dateConfig.format);
      }
    } catch {
      /* not a valid date, return raw value */
    }
  }

  return value;
}

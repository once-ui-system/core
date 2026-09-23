import { formatDistance } from "date-fns";

/**
 * Format a date to a short relative time string (e.g., "1d", "3mo", "2y")
 *
 * @param date The date to format
 * @returns A short relative time string
 */
export const formatShortRelativeTime = (date: Date | number): string => {
  const distance = formatDistance(date, new Date(), { includeSeconds: true });

  // Extract the number part
  const match = distance.match(/(\d+)/);
  const number = match ? match[0] : "";

  // Determine the unit
  let unit = "";
  if (distance.includes("second")) unit = "s";
  else if (distance.includes("minute")) unit = "m";
  else if (distance.includes("hour")) unit = "h";
  else if (distance.includes("day")) unit = "d";
  else if (distance.includes("month")) unit = "mo";
  else if (distance.includes("year")) unit = "y";

  // Return the formatted string
  return number + unit;
};

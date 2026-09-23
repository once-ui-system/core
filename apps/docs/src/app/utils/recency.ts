const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export interface DatedExample {
  updated?: string;
  created?: string;
}

/** True when the date string parses and falls within the last two weeks. */
export const isRecent = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const ts = new Date(dateStr).getTime();
  return !Number.isNaN(ts) && Date.now() - ts <= TWO_WEEKS_MS;
};

/** True when any example was created or updated within the last two weeks. */
export const hasRecentExample = (examples?: DatedExample[]): boolean =>
  examples?.some((example) => isRecent(example.updated || example.created)) ?? false;

/**
 * Logger utility that only logs in development mode.
 * Use this instead of console.log for debugging messages
 * that should not appear in production.
 */
export const dev = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      // biome-ignore lint/suspicious/noConsole: This is the dev logger implementation
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      // biome-ignore lint/suspicious/noConsole: This is the dev logger implementation
      console.info(...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      // biome-ignore lint/suspicious/noConsole: This is the dev logger implementation
      console.debug(...args);
    }
  },
};

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // The interaction tests drive whole components through user-event, and a
    // busy machine or CI runner can take them past the 5 s default.
    testTimeout: 15000,
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx"],
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.vitest.json",
    },
  },
});

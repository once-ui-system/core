import { defineConfig } from "vitest/config";

// The components render against the built @once-ui-system/core (its `dist`,
// through the workspace link), as an app does: build core before testing.
export default defineConfig({
  test: {
    environment: "jsdom",
    testTimeout: 15000,
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.json",
    },
  },
});

/**
 * The components against the real `react-native` package, with React Native's
 * own Jest preset mocking the native side; `pnpm test` (vitest) covers them
 * through react-native-web. See test-native/.
 */
module.exports = {
  preset: "@react-native/jest-preset",
  testMatch: ["<rootDir>/test-native/**/*.test.tsx"],
  // pnpm keeps packages under node_modules/.pnpm, so it has to be let through
  // for React Native's untranspiled sources to reach Babel.
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|react-native|@react-native|react-native-svg|@testing-library)/)",
  ],
  moduleNameMapper: {
    "^@once-ui-system/foundations/tokens.json$":
      "<rootDir>/../foundations/tokens/once-ui.tokens.json",
  },
};

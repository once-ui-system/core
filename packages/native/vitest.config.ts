import { defineConfig } from "vitest/config";

// Components render through react-native-web, which implements the same
// primitives (View, Text, Pressable, TextInput) on the DOM.
export default defineConfig({
  resolve: {
    alias: [{ find: /^react-native$/, replacement: "react-native-web" }],
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.{ts,tsx}"],
  },
});

import { AppRegistry, useColorScheme } from "react-native";
import { App } from "./App";

// The entry a React Native app would run: the same demo screens, registered
// with AppRegistry instead of rendered into a web page.
function NativeDemo() {
  return <App theme={useColorScheme() === "light" ? "light" : "dark"} />;
}

AppRegistry.registerComponent("OnceUINative", () => NativeDemo);

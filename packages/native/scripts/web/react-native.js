// The demo's "react-native": react-native-web, plus the native-module hooks
// that react-native-svg's shared files import but its web build never calls.
export * from "react-native-web";
export const TurboModuleRegistry = { get: () => null, getEnforcing: () => null };
export const codegenNativeComponent = () => null;

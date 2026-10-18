import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";
import type {
  BodyLineHeight,
  BodySize,
  BorderStyle,
  DeviceFontSize,
  NeutralColor,
  ScalingSize,
  Schemes,
  SolidStyle,
  SolidType,
  SurfaceStyle,
  Theme,
} from "../types";
import { defaultSettings } from "./resolve";
import { createTheme, type FontFamilies, type Insets, NO_INSETS, type OnceTheme } from "./theme";

export interface ThemeProviderProps {
  /** `"system"` follows the device's appearance. */
  theme?: Theme;
  brand?: Schemes;
  accent?: Schemes;
  neutral?: NeutralColor;
  solid?: SolidType;
  solidStyle?: SolidStyle;
  border?: BorderStyle;
  surface?: SurfaceStyle;
  scaling?: ScalingSize;
  bodySize?: BodySize;
  bodyLineHeight?: BodyLineHeight;
  desktopSize?: DeviceFontSize;
  tabletSize?: DeviceFontSize;
  mobileSize?: DeviceFontSize;
  /** Font families the app has loaded; the platform font is used for any left out. */
  fonts?: FontFamilies;
  /**
   * Safe-area insets in points, for `Dialog`, toasts and `Flex`'s `safeArea`.
   * React Native has no cross-platform API for them, so pass
   * `useSafeAreaInsets()` from react-native-safe-area-context.
   */
  insets?: Insets;
  children: ReactNode;
}

const ThemeContext = createContext<OnceTheme | null>(null);

/**
 * Takes the style options of core's `ThemeProvider` (same names, same
 * defaults) and resolves them against the shared token export, so a native
 * screen and a web page with the same options get the same colours, spacing,
 * radii and type.
 */
export function ThemeProvider({
  theme = "system",
  fonts,
  insets = NO_INSETS,
  children,
  ...options
}: ThemeProviderProps) {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const resolvedTheme = theme === "system" ? (scheme === "light" ? "light" : "dark") : theme;
  // Insets by value too: `useSafeAreaInsets()` returns a new object on every render.
  const key = JSON.stringify([resolvedTheme, options, fonts, insets]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` carries options, fonts and insets by value.
  const value = useMemo(
    () =>
      createTheme({ ...defaultSettings, ...options, theme: resolvedTheme }, width, fonts, insets),
    [key, width],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The resolved theme. Outside a `ThemeProvider`, core's defaults in dark. */
export function useTheme(): OnceTheme {
  const context = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  return useMemo(
    () => context ?? createTheme({ ...defaultSettings, theme: "dark" }, width),
    [context, width],
  );
}

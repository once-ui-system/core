import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";
import type {
  BodyLineHeight,
  BodySize,
  BorderStyle,
  Density,
  DeviceFontSize,
  NeutralColor,
  ScalingSize,
  Schemes,
  SolidStyle,
  SolidType,
  SurfaceStyle,
  Theme,
} from "../types";
import { DENSITIES, defaultSettings } from "./resolve";
import { createTheme, type FontFamilies, type OnceTheme } from "./theme";

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
  /** Left out, `density` picks it: compact 95, normal 100, spacious 105. */
  scaling?: ScalingSize;
  /**
   * The size Button, IconButton, Tag, Checkbox, Switch and RadioGroup take
   * when given none: s when `"compact"`, m when `"normal"` (the default), l
   * when `"spacious"`. A `size` on the control always wins.
   */
  density?: Density;
  bodySize?: BodySize;
  bodyLineHeight?: BodyLineHeight;
  desktopSize?: DeviceFontSize;
  tabletSize?: DeviceFontSize;
  mobileSize?: DeviceFontSize;
  /** Font families the app has loaded; the platform font is used for any left out. */
  fonts?: FontFamilies;
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
  children,
  ...options
}: ThemeProviderProps) {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const resolvedTheme = theme === "system" ? (scheme === "light" ? "light" : "dark") : theme;
  const key = JSON.stringify([resolvedTheme, options, fonts]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` carries options and fonts by value.
  const value = useMemo(() => {
    const density = options.density ?? defaultSettings.density;
    // A scaling of its own wins; without one the density picks it.
    const scaling = options.scaling ?? DENSITIES[density].scaling;
    return createTheme(
      { ...defaultSettings, ...options, density, scaling, theme: resolvedTheme },
      width,
      fonts,
    );
  }, [key, width]);
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

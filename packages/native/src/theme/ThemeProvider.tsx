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
import { customSchemeTokens, type SchemeScale } from "./colorScheme";
import { DENSITIES, defaultSettings } from "./resolve";
import { createTheme, type FontFamilies, type Insets, NO_INSETS, type OnceTheme } from "./theme";

export interface ThemeProviderProps {
  /** `"system"` follows the device's appearance. */
  theme?: Theme;
  /** `"custom"` reads `brandSeed` or `brandScale`, as `data-brand="custom"` does on the web. */
  brand?: Schemes | "custom";
  accent?: Schemes | "custom";
  neutral?: NeutralColor | "custom";
  /**
   * A colour to generate the brand scheme from (hex, `rgb()` or `oklch()`), for
   * `brand: "custom"`, which it implies when `brand` is not set. As core's `brandSeed`.
   */
  brandSeed?: string;
  /** As `brandSeed`, for `accent: "custom"`. */
  accentSeed?: string;
  /** As `brandSeed`, for `neutral: "custom"`. */
  neutralSeed?: string;
  /**
   * The brand scheme step by step (`100`…`1200`), the native side of the
   * `--scheme-brand-*` properties a web app sets in its own CSS. Wins over
   * `brandSeed`, and also implies `brand: "custom"`.
   */
  brandScale?: SchemeScale;
  /** As `brandScale`, for `accent: "custom"`. */
  accentScale?: SchemeScale;
  /** As `brandScale`, for `neutral: "custom"`. */
  neutralScale?: SchemeScale;
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
  brandSeed,
  accentSeed,
  neutralSeed,
  brandScale,
  accentScale,
  neutralScale,
  children,
  ...options
}: ThemeProviderProps) {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const resolvedTheme = theme === "system" ? (scheme === "light" ? "light" : "dark") : theme;
  // Insets by value too: `useSafeAreaInsets()` returns a new object on every render.
  const seeds = { brand: brandSeed, accent: accentSeed, neutral: neutralSeed };
  const scales = { brand: brandScale, accent: accentScale, neutral: neutralScale };
  const key = JSON.stringify([resolvedTheme, options, fonts, insets, seeds, scales]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` carries everything else by value.
  const value = useMemo(() => {
    const density = options.density ?? defaultSettings.density;
    // A scaling of its own wins; without one the density picks it.
    const scaling = options.scaling ?? DENSITIES[density].scaling;
    // A seed or scale picks "custom" for its scheme unless the scheme is set, as in core.
    const custom = {
      ...((brandSeed || brandScale) && { brand: "custom" as const }),
      ...((accentSeed || accentScale) && { accent: "custom" as const }),
      ...((neutralSeed || neutralScale) && { neutral: "custom" as const }),
    };
    return createTheme(
      { ...defaultSettings, ...custom, ...options, density, scaling, theme: resolvedTheme },
      width,
      fonts,
      insets,
      customSchemeTokens(seeds, scales),
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

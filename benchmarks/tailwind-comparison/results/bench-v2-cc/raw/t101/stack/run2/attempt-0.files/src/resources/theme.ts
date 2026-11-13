import type {
  BorderStyle,
  NeutralColor,
  ScalingSize,
  Schemes,
  SolidStyle,
  SolidType,
  SurfaceStyle,
  Theme,
  TransitionStyle,
} from "@once-ui-system/core";
import { style } from "./once-ui.config";

/**
 * Lumen's theme in one place: ThemeInit (server, in the root layout) and
 * ThemeProvider (client, in Providers) both read it, so every screen follows it.
 */
export const themeProps = {
  theme: style.theme as Theme,
  defaultTheme: style.defaultTheme as Theme,
  brand: style.brand as Schemes | "custom",
  accent: style.accent as Schemes | "custom",
  neutral: style.neutral as NeutralColor,
  solid: style.solid as SolidType,
  solidStyle: style.solidStyle as SolidStyle,
  border: style.border as BorderStyle,
  surface: style.surface as SurfaceStyle,
  transition: style.transition as TransitionStyle,
  scaling: style.scaling as ScalingSize,
  brandSeed: style.brandSeed,
  brandScale: style.brandScale,
  pageBackground: style.pageBackground,
  surfaceBackground: style.surfaceBackground,
};

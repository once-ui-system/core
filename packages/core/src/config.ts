import type { OnceUIDataStyleConfig } from "./contexts/DataThemeProvider";
import type { OnceUIStyleConfig } from "./contexts/ThemeProvider";

/**
 * A font the root layout applies by class name: what `next/font` returns.
 * Put `variable` on `<html>` and the font is available as the CSS variable it
 * was created with (`--font-heading`, `--font-body`…).
 */
export interface OnceUIFont {
  variable: string;
  className?: string;
  style?: { fontFamily: string; fontWeight?: number | string; fontStyle?: string };
}

/**
 * The four roles Once UI's type scale reads, plus anything else the app loads
 * (a list of display faces, an accent family). Extra keys are the app's own.
 */
export interface OnceUIFonts {
  heading?: OnceUIFont;
  body?: OnceUIFont;
  label?: OnceUIFont;
  code?: OnceUIFont;
  [key: string]: OnceUIFont | OnceUIFont[] | undefined;
}

/** The sections of `once-ui.config` that Once UI itself reads. */
export interface OnceUIConfigSections {
  /** The site's origin: what `Meta` and `Schema` take as `baseURL`. */
  baseURL?: string;
  fonts?: OnceUIFonts;
  /** `<ThemeProvider {...style}>` and `<ThemeInit config={style} />`. */
  style?: OnceUIStyleConfig;
  /** `<DataThemeProvider {...dataStyle}>` and `<ThemeInit dataStyle={dataStyle} />`. */
  dataStyle?: OnceUIDataStyleConfig;
}

/**
 * The shape of an app's `once-ui.config`.
 *
 * The sections Once UI reads are typed; anything else (`schema`, `social`,
 * `layout`…) belongs to the app and is passed through untouched.
 */
export interface OnceUIConfig extends OnceUIConfigSections {
  [key: string]: unknown;
}

/**
 * `T`, with every key the matching section does not declare turned into
 * `never` — so a misspelt key fails to compile instead of being ignored.
 * Arrays, functions and shapes with an index signature are left alone.
 */
type Exactly<T, Shape> = T extends readonly unknown[]
  ? T
  : T extends (...args: never[]) => unknown
    ? T
    : T extends object
      ? string extends keyof Shape
        ? T
        : { [K in keyof T]: K extends keyof Shape ? Exactly<T[K], NonNullable<Shape[K]>> : never }
      : T;

type CheckedConfig<T> = {
  [K in keyof T]: K extends keyof OnceUIConfigSections
    ? Exactly<T[K], NonNullable<OnceUIConfigSections[K]>>
    : T[K];
};

/**
 * Type an app's `once-ui.config`. It returns its argument unchanged; what it
 * adds is checking and inference.
 *
 * Every value is checked against the union Once UI accepts (`brand: "yelow"`
 * fails), a misspelt key in a section Once UI owns fails (`solidstyle`), and
 * the result keeps the literal types it was written with, so the sections go
 * to the providers with no casts:
 *
 * ```ts
 * // once-ui.config.ts (or .js — the types come through either way)
 * export const { style, dataStyle } = defineConfig({
 *   style: { theme: "system", brand: "cyan", solidStyle: "flat" },
 *   dataStyle: { variant: "gradient", mode: "categorical" },
 * });
 *
 * // layout.tsx
 * <ThemeInit config={style} dataStyle={dataStyle} />
 * <ThemeProvider {...style}>
 *   <DataThemeProvider {...dataStyle}>…</DataThemeProvider>
 * </ThemeProvider>
 * ```
 */
export function defineConfig<T extends OnceUIConfig>(config: T & CheckedConfig<T>): T {
  return config;
}

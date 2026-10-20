"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { Schemes } from "../types.js";
import { customSchemeProperties, type SchemeScale } from "../utils/colorScheme.js";
import { DEFAULT_DENSITY, type Density, densityScaling } from "../utils/density.js";
import { dev } from "../utils/devLogger.js";

export type { Density } from "../utils/density.js";

export type Theme = "dark" | "light" | "system";
/** Every neutral scheme tokens.css ships a `[data-neutral]` mapping for. */
export type NeutralColor = "sand" | "gray" | "slate" | "rose" | "mint" | "dusk";
export type SolidType = "color" | "contrast" | "inverse";
export type SolidStyle = "flat" | "plastic";
/** Every corner style tokens.css ships a `[data-border]` mapping for. */
export type BorderStyle = "rounded" | "playful" | "conservative" | "sharp";
export type SurfaceStyle = "filled" | "translucent";
export type TransitionStyle = "all" | "micro" | "macro" | "none";
export type ScalingSize = "90" | "95" | "100" | "105" | "110";
export type BodySize = "90" | "95" | "100" | "105" | "110";
export type BodyLineHeight = "90" | "100" | "110" | "120";
/**
 * The root font size, in px, for one width range — what `rem` resolves to,
 * so everything sized in rem follows it. Defaults: 16 on desktop and tablet,
 * 15 on mobile.
 */
export type DeviceFontSize = "13" | "14" | "15" | "16" | "17" | "18";
/** The cursor over interactive elements. Defaults to `"pointer"`. */
export type InteractiveCursor = "pointer" | "default";

/**
 * Where style choices are read from and written to.
 *
 * `"local"` keeps today's behaviour: every change is mirrored into
 * localStorage under `data-<kebab-key>`. `"none"` applies choices to the
 * document but persists nothing — the right setting when a host owns the
 * state, for example an editor holding an unsaved draft.
 *
 * An adapter routes persistence somewhere else entirely, such as a database.
 * `get` is synchronous because it runs during hydration, where an await would
 * show a flash of the wrong theme; when the values live somewhere async, omit
 * it and seed the provider through its props from the server instead. `set`
 * and `remove` may return a promise — nothing waits on them.
 */
export type StylePersistenceAdapter = {
  get?: (key: string) => string | null;
  set: (key: string, value: string) => void | Promise<void>;
  remove?: (key: string) => void | Promise<void>;
};

export type StylePersistence = "local" | "none" | StylePersistenceAdapter;

const localAdapter: StylePersistenceAdapter = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};

function resolvePersistence(persistence: StylePersistence = "local") {
  if (persistence === "none") return null;
  if (persistence === "local") return localAdapter;
  return persistence;
}
export type DataStyle = "categorical" | "divergent" | "sequential";

/**
 * The `style` section of `once-ui.config`, exactly as the file writes it.
 *
 * Every key is optional and named the way `ThemeProvider` takes it, so the
 * object goes to the providers as written — `<ThemeProvider {...style}>` and
 * `<ThemeInit config={style} />` — with no casts and no renaming. Each key
 * becomes the `data-<kebab-key>` attribute on `<html>` (`solidStyle` →
 * `data-solid-style`).
 */
export interface OnceUIStyleConfig {
  /**
   * On `ThemeProvider`, `"light"` or `"dark"` *forces* that theme: a visitor's
   * choice is ignored and `setTheme` cannot change it. For a theme that is
   * only the starting point, leave this `"system"` and set `defaultTheme`.
   */
  theme?: Theme;
  /**
   * The theme a visitor sees until they choose one, which they can then
   * change. `"light"` gives a light site with a working theme switch.
   * `ThemeInit` reads it too, so the first paint is already right.
   */
  defaultTheme?: Theme;
  neutral?: NeutralColor | "custom";
  brand?: Schemes | "custom";
  accent?: Schemes | "custom";
  solid?: SolidType;
  solidStyle?: SolidStyle;
  border?: BorderStyle;
  surface?: SurfaceStyle;
  transition?: TransitionStyle;
  /**
   * Everything sized in rem, and every number on a size, spacing or offset
   * prop, multiplied by this percentage: `data-scaling`. Left out, `density`
   * picks it (compact 95, normal 100, spacious 105).
   */
  scaling?: ScalingSize;
  /**
   * How roomy the controls are: `data-density`. Every Button, IconButton,
   * ToggleButton, SegmentedControl, Tag, Switch, Checkbox, RadioButton and
   * Slider given no `size` takes s when `"compact"`, m when `"normal"` (the
   * default) and l when `"spacious"`, through CSS; a `size` on the control,
   * or on its `Form`, always wins. Without its own `scaling` the theme also
   * scales to 95, 100 or 105.
   */
  density?: Density;
  bodySize?: BodySize;
  bodyLineHeight?: BodyLineHeight;
  /** Root font size above 1024px: `data-desktop-size`. */
  desktopSize?: DeviceFontSize;
  /** Root font size from 769px to 1024px: `data-tablet-size`. */
  tabletSize?: DeviceFontSize;
  /** Root font size at 768px and below: `data-mobile-size`. */
  mobileSize?: DeviceFontSize;
  /** `data-cursor-interactive`. */
  cursorInteractive?: InteractiveCursor;
  /**
   * A colour to generate the brand scheme from — hex, `rgb()` or `oklch()` —
   * for `brand: "custom"`, which it implies when `brand` is not set.
   * `ThemeInit` renders the scheme on the server, so it is there before the
   * first paint.
   */
  brandSeed?: string;
  /** As {@link OnceUIStyleConfig.brandSeed}, for `accent: "custom"`. */
  accentSeed?: string;
  /** As {@link OnceUIStyleConfig.brandSeed}, for `neutral: "custom"`. */
  neutralSeed?: string;
  /**
   * The brand scheme step by step, `{ 100: "#…", …, 1200: "#…" }`, for exact
   * brand colours. Implies `brand: "custom"`. Steps it leaves out come from
   * `brandSeed`; without a seed it needs at least step 600.
   */
  brandScale?: SchemeScale;
  /** As {@link OnceUIStyleConfig.brandScale}, for `accent: "custom"`. */
  accentScale?: SchemeScale;
  /** As {@link OnceUIStyleConfig.brandScale}, for `neutral: "custom"`. */
  neutralScale?: SchemeScale;
}

interface StyleOptions {
  theme: Theme;
  neutral: NeutralColor | "custom";
  brand: Schemes | "custom";
  accent: Schemes | "custom";
  solid: SolidType;
  solidStyle: SolidStyle;
  border: BorderStyle;
  surface: SurfaceStyle;
  transition: TransitionStyle;
  scaling: ScalingSize;
  density: Density;
  bodySize: BodySize;
  bodyLineHeight: BodyLineHeight;
  // No defaults: the CSS already has them, and writing them onto <html>
  // would override an app that sets the custom properties itself.
  desktopSize?: DeviceFontSize;
  tabletSize?: DeviceFontSize;
  mobileSize?: DeviceFontSize;
  cursorInteractive?: InteractiveCursor;
}

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

type StyleProviderState = StyleOptions & {
  setStyle: (style: Partial<StyleOptions>) => void;
};

export type ThemeProviderProps = OnceUIStyleConfig & {
  children: React.ReactNode;
  /** Defaults to `"local"`. See {@link StylePersistence}. */
  persistence?: StylePersistence;
};

const initialThemeState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => null,
};

const defaultStyleOptions: StyleOptions = {
  theme: "system",
  neutral: "gray",
  brand: "blue",
  accent: "indigo",
  solid: "contrast",
  solidStyle: "flat",
  border: "playful",
  surface: "filled",
  transition: "all",
  scaling: "100",
  density: DEFAULT_DENSITY,
  bodySize: "100",
  bodyLineHeight: "100",
};

const initialStyleState: StyleProviderState = {
  ...defaultStyleOptions,
  setStyle: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialThemeState);
const StyleProviderContext = createContext<StyleProviderState>(initialStyleState);

function getStoredStyleValues(store: StylePersistenceAdapter | null) {
  if (typeof window === "undefined" || !store?.get) return {};

  try {
    // Stored values are whatever an earlier visit wrote; they are trusted to
    // be one of the union's members, as they always have been.
    const storedStyle: Record<string, string> = {};
    const styleKeys = [
      "neutral",
      "brand",
      "accent",
      "solid",
      "solid-style",
      "border",
      "surface",
      "transition",
      "scaling",
      "density",
      "body-size",
      "body-line-height",
      "desktop-size",
      "tablet-size",
      "mobile-size",
      "cursor-interactive",
    ];

    for (const kebabKey of styleKeys) {
      const camelKey = kebabKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = store.get(`data-${kebabKey}`);
      if (value) storedStyle[camelKey] = value;
    }

    return storedStyle as Partial<StyleOptions>;
  } catch (e) {
    dev.error("Error reading stored style values:", e);
    return {};
  }
}

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

/** The visitor's saved choice, else the default. Client only. */
const getStoredTheme = (store: StylePersistenceAdapter | null, defaultTheme: Theme): Theme => {
  const savedTheme = store?.get?.("data-theme") ?? null;
  return isTheme(savedTheme) ? savedTheme : defaultTheme;
};

/** What ThemeInit painted, else the fallback. Client only. */
const getDomResolvedTheme = (fallback: "light" | "dark"): "light" | "dark" => {
  const domTheme = document.documentElement.getAttribute("data-theme");
  return domTheme === "dark" || domTheme === "light" ? domTheme : fallback;
};

// Layout effect on the client, so the stored theme is in state before paint;
// a plain effect on the server, where layout effects warn.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeProvider({
  children,
  theme: propTheme = "system",
  defaultTheme = "system",
  neutral,
  brand,
  accent,
  solid,
  solidStyle,
  border,
  surface,
  transition,
  scaling,
  density,
  bodySize,
  bodyLineHeight,
  desktopSize,
  tabletSize,
  mobileSize,
  cursorInteractive,
  brandSeed,
  accentSeed,
  neutralSeed,
  brandScale,
  accentScale,
  neutralScale,
  persistence = "local",
}: ThemeProviderProps) {
  const store = useMemo(() => resolvePersistence(persistence), [persistence]);
  const isForced = propTheme !== "system";
  // The first render is the same on the server and the client, so nothing
  // that reads the theme mismatches on hydration; the saved choice and what
  // ThemeInit painted are read in the layout effect below, before paint.
  const [theme, setTheme] = useState<Theme>(isForced ? propTheme : defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    isForced ? propTheme : defaultTheme === "light" ? "light" : "dark",
  );
  // False until the saved theme is in state: before that, writing `theme` to
  // the DOM would overwrite what ThemeInit painted with the default.
  const [themeSynced, setThemeSynced] = useState(isForced);

  useIsomorphicLayoutEffect(() => {
    if (isForced) return;
    setTheme(getStoredTheme(store, defaultTheme));
    setResolvedTheme((current) => getDomResolvedTheme(current));
    setThemeSynced(true);
  }, [isForced, store, defaultTheme]);

  const getResolvedTheme = useCallback((t: Theme): "light" | "dark" => {
    if (t === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return t;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only listen for system theme changes if:
    // 1. Current theme is 'system' AND
    // 2. propTheme is 'system' (not forcing light/dark)
    if (theme === "system" && propTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        const newResolved = mediaQuery.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newResolved);
        setResolvedTheme(newResolved);
        dev.log(`System theme changed to: ${newResolved}`);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, propTheme]);

  const setThemeAndSave = useCallback(
    (newTheme: Theme) => {
      try {
        // If propTheme is light/dark, we always use that for the DOM (forced mode)
        const resolved = isForced
          ? propTheme
          : newTheme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : newTheme;

        // Only persist if not in forced mode
        if (!isForced) {
          // With a light or dark default, "system" has to be saved: removing
          // the key would bring the default back on the next load.
          if (newTheme === "system" && defaultTheme === "system") {
            store?.remove?.("data-theme");
          } else {
            store?.set("data-theme", newTheme);
          }
        }

        // Always update React state
        setTheme(newTheme);
        setResolvedTheme(resolved);

        // Set the DOM attribute to the resolved theme
        document.documentElement.setAttribute("data-theme", resolved);

        dev.log(`Theme set to ${newTheme} (resolved: ${resolved})`);
      } catch (e) {
        dev.error("Error setting theme:", e);
      }
    },
    [propTheme, isForced, defaultTheme, store],
  );

  const storedValues = typeof window !== "undefined" ? getStoredStyleValues(store) : {};

  const directProps: Partial<StyleOptions> = {};
  if (neutral) directProps.neutral = neutral;
  if (brand) directProps.brand = brand;
  if (accent) directProps.accent = accent;
  if (solid) directProps.solid = solid;
  if (solidStyle) directProps.solidStyle = solidStyle;
  if (border) directProps.border = border;
  if (surface) directProps.surface = surface;
  if (transition) directProps.transition = transition;
  if (scaling) directProps.scaling = scaling;
  if (density) directProps.density = density;
  if (bodySize) directProps.bodySize = bodySize;
  if (bodyLineHeight) directProps.bodyLineHeight = bodyLineHeight;
  if (desktopSize) directProps.desktopSize = desktopSize;
  if (tabletSize) directProps.tabletSize = tabletSize;
  if (mobileSize) directProps.mobileSize = mobileSize;
  if (cursorInteractive) directProps.cursorInteractive = cursorInteractive;

  // A seed's scheme, written as the `--scheme-<name>-*` properties that
  // `data-<name>="custom"` reads. ThemeInit puts the same values in a server-
  // rendered <style>; writing them here as well is what lets a seed change
  // after load, and what makes a seed work in an app without ThemeInit.
  const schemeProperties = useMemo(
    () =>
      customSchemeProperties(
        { brand: brandSeed, accent: accentSeed, neutral: neutralSeed },
        { brand: brandScale, accent: accentScale, neutral: neutralScale },
      ),
    [brandSeed, accentSeed, neutralSeed, brandScale, accentScale, neutralScale],
  );
  // A seed implies "custom" when the scheme is not named — but only a seed
  // that parsed, or the scheme would point at properties that do not exist.
  if (!brand && schemeProperties["--scheme-brand-600"]) directProps.brand = "custom";
  if (!accent && schemeProperties["--scheme-accent-600"]) directProps.accent = "custom";
  if (!neutral && schemeProperties["--scheme-neutral-600"]) directProps.neutral = "custom";

  // A scaling set by a prop or chosen earlier (stored) is the theme's own;
  // otherwise the density picks it, now and whenever the density changes.
  const [scalingSet, setScalingSet] = useState(Boolean(scaling || storedValues.scaling));

  const [style, setStyleState] = useState<StyleOptions>(() => {
    const initial = { ...defaultStyleOptions, ...directProps, ...storedValues, theme };
    if (!scaling && !storedValues.scaling) {
      initial.scaling = densityScaling(initial.density) ?? initial.scaling;
    }
    return initial;
  });

  useEffect(() => {
    setStyleState((prevStyle) => ({
      ...prevStyle,
      theme: theme,
    }));
  }, [theme]);

  const themeValue = {
    theme,
    resolvedTheme,
    setTheme: setThemeAndSave,
  };

  const camelToKebab = (str: string): string => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  };

  const styleValue: StyleProviderState = {
    ...style,
    setStyle: (newStyle: Partial<StyleOptions>) => {
      // A new density brings its scaling along, unless the scaling is the
      // theme's own; that one is applied but not stored, so it is worked
      // out again from the density on the next visit.
      const derived =
        newStyle.density && !newStyle.scaling && !scalingSet
          ? densityScaling(newStyle.density)
          : undefined;
      if (newStyle.scaling) setScalingSet(true);
      setStyleState((prevStyle) => ({
        ...prevStyle,
        ...newStyle,
        ...(derived && { scaling: derived }),
      }));
      if (derived) document.documentElement.setAttribute("data-scaling", derived);

      Object.entries(newStyle).forEach(([key, value]) => {
        if (value && key !== "setStyle") {
          const attrName = `data-${camelToKebab(key)}`;

          if (key === "theme") {
            if (value === "system") {
              if (defaultTheme === "system") store?.remove?.("data-theme");
              else store?.set("data-theme", "system");
              const resolvedValue = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
              document.documentElement.setAttribute(attrName, resolvedValue);
            } else {
              store?.set("data-theme", value.toString());
              document.documentElement.setAttribute(attrName, value.toString());
            }
          } else {
            document.documentElement.setAttribute(attrName, value.toString());
            store?.set(attrName, value.toString());
          }
        }
      });
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      Object.entries(style).forEach(([key, value]) => {
        if (value && key !== "setStyle") {
          if (key === "theme") {
            if (!themeSynced) return;
            // If propTheme is light/dark, always use that for the DOM (forced mode)
            if (propTheme !== "system") {
              document.documentElement.setAttribute(`data-${camelToKebab(key)}`, propTheme);
            } else if (value === "system") {
              const resolvedValue = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
              document.documentElement.setAttribute(`data-${camelToKebab(key)}`, resolvedValue);
            } else {
              document.documentElement.setAttribute(`data-${camelToKebab(key)}`, value.toString());
            }
          } else {
            document.documentElement.setAttribute(`data-${camelToKebab(key)}`, value.toString());
          }
        }
      });
    }
  }, [style, propTheme, themeSynced]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [property, value] of Object.entries(schemeProperties)) {
      root.style.setProperty(property, value);
    }
    return () => {
      for (const property of Object.keys(schemeProperties)) root.style.removeProperty(property);
    };
  }, [schemeProperties]);

  return (
    <ThemeProviderContext.Provider value={themeValue}>
      <StyleProviderContext.Provider value={styleValue}>{children}</StyleProviderContext.Provider>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useStyle = () => {
  const context = useContext(StyleProviderContext);
  if (context === undefined) {
    throw new Error("useStyle must be used within a ThemeProvider");
  }
  return context;
};

export { defaultStyleOptions };

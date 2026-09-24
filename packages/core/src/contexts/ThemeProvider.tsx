"use client";

import { Schemes } from "../types";
import { dev } from "../utils/devLogger";
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export type Theme = "dark" | "light" | "system";
export type NeutralColor = "sand" | "gray" | "slate";
export type SolidType = "color" | "contrast" | "inverse";
export type SolidStyle = "flat" | "plastic";
export type BorderStyle = "rounded" | "playful" | "conservative";
export type SurfaceStyle = "filled" | "translucent";
export type TransitionStyle = "all" | "micro" | "macro" | "none";
export type ScalingSize = "90" | "95" | "100" | "105" | "110";
export type BodySize = "90" | "95" | "100" | "105" | "110";
export type BodyLineHeight = "90" | "100" | "110" | "120";

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
  bodySize: BodySize;
  bodyLineHeight: BodyLineHeight;
}

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

type StyleProviderState = StyleOptions & {
  setStyle: (style: Partial<StyleOptions>) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  theme?: Theme;
  neutral?: NeutralColor | "custom";
  brand?: Schemes | "custom";
  accent?: Schemes | "custom";
  solid?: SolidType;
  solidStyle?: SolidStyle;
  border?: BorderStyle;
  surface?: SurfaceStyle;
  transition?: TransitionStyle;
  scaling?: ScalingSize;
  bodySize?: BodySize;
  bodyLineHeight?: BodyLineHeight;
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
    const storedStyle: Partial<StyleOptions> = {};
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
      "body-size",
      "body-line-height",
    ];

    styleKeys.forEach((key) => {
      const kebabKey = key;
      const camelKey = kebabKey.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      ) as keyof StyleOptions;
      const value = store.get!(`data-${kebabKey}`);

      if (value) {
        if (camelKey === "border") {
          storedStyle[camelKey] = value as BorderStyle;
        } else if (camelKey === "solidStyle") {
          storedStyle[camelKey] = value as SolidStyle;
        } else if (camelKey === "transition") {
          storedStyle[camelKey] = value as TransitionStyle;
        } else if (camelKey === "scaling") {
          storedStyle[camelKey] = value as ScalingSize;
        } else if (camelKey === "surface") {
          storedStyle[camelKey] = value as SurfaceStyle;
        } else if (camelKey === "neutral") {
          storedStyle.neutral = value as NeutralColor;
        } else if (camelKey === "brand") {
          storedStyle.brand = value as Schemes;
        } else if (camelKey === "accent") {
          storedStyle.accent = value as Schemes;
        } else if (camelKey === "solid") {
          storedStyle.solid = value as SolidType;
        } else if (camelKey === "bodySize") {
          storedStyle.bodySize = value as BodySize;
        } else if (camelKey === "bodyLineHeight") {
          storedStyle.bodyLineHeight = value as BodyLineHeight;
        }
      }
    });

    return storedStyle;
  } catch (e) {
    dev.error("Error reading stored style values:", e);
    return {};
  }
}

const getInitialTheme = (store: StylePersistenceAdapter | null): Theme => {
  if (typeof window === "undefined") return "system";

  const savedTheme = (store?.get?.("data-theme") ?? null) as Theme | null;
  if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
    return savedTheme;
  }

  const domTheme = document.documentElement.getAttribute("data-theme");
  if (domTheme === "dark" || domTheme === "light") {
    return "system";
  }

  return "system";
};

const getInitialResolvedTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";

  const domTheme = document.documentElement.getAttribute("data-theme");
  return domTheme === "dark" || domTheme === "light" ? (domTheme as "light" | "dark") : "dark";
};

export function ThemeProvider({
  children,
  theme: propTheme = "system",
  neutral,
  brand,
  accent,
  solid,
  solidStyle,
  border,
  surface,
  transition,
  scaling,
  bodySize,
  bodyLineHeight,
  persistence = "local",
}: ThemeProviderProps) {
  const store = useMemo(() => resolvePersistence(persistence), [persistence]);
  // If propTheme is light/dark, use it directly (forced mode)
  // Otherwise, use the stored preference from localStorage/DOM
  const initialThemeValue = propTheme !== "system" ? propTheme : getInitialTheme(store);

  // For resolvedTheme, if propTheme is light/dark, use that directly
  // Otherwise, get from DOM
  const initialResolvedValue = propTheme !== "system" ? propTheme : getInitialResolvedTheme();

  const [theme, setTheme] = useState<Theme>(initialThemeValue);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(initialResolvedValue);

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
        const isForced = propTheme !== "system";
        const resolved = isForced
          ? propTheme
          : newTheme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : newTheme;

        // Only persist if not in forced mode
        if (!isForced) {
          if (newTheme === "system") {
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
    [propTheme],
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
  if (bodySize) directProps.bodySize = bodySize;
  if (bodyLineHeight) directProps.bodyLineHeight = bodyLineHeight;

  const [style, setStyleState] = useState<StyleOptions>({
    ...defaultStyleOptions,
    ...directProps,
    ...storedValues,
    theme: theme,
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
      setStyleState((prevStyle) => ({
        ...prevStyle,
        ...newStyle,
      }));

      Object.entries(newStyle).forEach(([key, value]) => {
        if (value && key !== "setStyle") {
          const attrName = `data-${camelToKebab(key)}`;

          if (key === "theme") {
            if (value === "system") {
              store?.remove?.("data-theme");
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
  }, [style, propTheme]);

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

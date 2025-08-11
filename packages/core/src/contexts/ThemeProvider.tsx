"use client";

import { Schemes } from "../types";
import { dev } from "../utils";
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export type Theme = "dark" | "light" | "system";
export type NeutralColor = "sand" | "gray" | "slate";
export type SolidType = "color" | "contrast" | "inverse";
export type SolidStyle = "flat" | "plastic";
export type BorderStyle = "rounded" | "playful" | "conservative";
export type SurfaceStyle = "filled" | "translucent";
export type TransitionStyle = "all" | "micro" | "macro" | "none";
export type ScalingSize = "90" | "95" | "100" | "105" | "110";
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
};

const initialStyleState: StyleProviderState = {
  ...defaultStyleOptions,
  setStyle: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialThemeState);
const StyleProviderContext = createContext<StyleProviderState>(initialStyleState);

function getStoredStyleValues() {
  if (typeof window === "undefined") return {};

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
    ];

    styleKeys.forEach((key) => {
      const kebabKey = key;
      const camelKey = kebabKey.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      ) as keyof StyleOptions;
      const value = localStorage.getItem(`data-${kebabKey}`);

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
        }
      }
    });

    return storedStyle;
  } catch (e) {
    dev.error("Error reading stored style values:", e);
    return {};
  }
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "system";

  const savedTheme = localStorage.getItem("data-theme") as Theme | null;
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
}: ThemeProviderProps) {
  // If propTheme is light/dark, use it directly (forced mode)
  // Otherwise, use the stored preference from localStorage/DOM
  const initialThemeValue = propTheme !== "system" ? propTheme : getInitialTheme();

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

        // Only update localStorage if not in forced mode
        if (!isForced) {
          if (newTheme === "system") {
            localStorage.removeItem("data-theme");
          } else {
            localStorage.setItem("data-theme", newTheme);
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

  const storedValues = typeof window !== "undefined" ? getStoredStyleValues() : {};

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
              localStorage.removeItem("data-theme");
              const resolvedValue = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
              document.documentElement.setAttribute(attrName, resolvedValue);
            } else {
              localStorage.setItem("data-theme", value.toString());
              document.documentElement.setAttribute(attrName, value.toString());
            }
          } else {
            document.documentElement.setAttribute(attrName, value.toString());
            localStorage.setItem(`data-${camelToKebab(key)}`, value.toString());
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

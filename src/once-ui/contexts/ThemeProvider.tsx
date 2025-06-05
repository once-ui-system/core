"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type NeutralColor = "sand" | "gray" | "slate";
export type BrandColor = "blue" | "indigo" | "violet" | "magenta" | "pink" | "red" | "orange" | "yellow" | "moss" | "green" | "emerald" | "aqua" | "cyan";
export type SolidType = "color" | "contrast" | "inverse";
export type SolidStyle = "flat" | "plastic";
export type BorderStyle = "rounded" | "playful" | "conservative";
export type SurfaceStyle = "filled" | "translucent";
export type TransitionStyle = "all" | "micro" | "macro" | "none";
export type ScalingSize = "90" | "95" | "100" | "105" | "110";
export type DataStyle = "categorical" | "divergent" | "sequential";

interface StyleOptions {
  theme: Theme;
  neutral: NeutralColor;
  brand: BrandColor;
  accent: BrandColor;
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
  initialTheme?: Theme;
  neutral?: NeutralColor;
  brand?: BrandColor;
  accent?: BrandColor;
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
  theme: "dark",
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
  if (typeof window === 'undefined') return {};
  
  try {
    const storedStyle: Partial<StyleOptions> = {};
    const styleKeys = ['neutral', 'brand', 'accent', 'solid', 'solid-style', 'border', 'surface', 'transition', 'scaling'];
    
    styleKeys.forEach(key => {
      const kebabKey = key;
      const camelKey = kebabKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) as keyof StyleOptions;
      const value = localStorage.getItem(`data-${kebabKey}`);
      
      if (value) {
        if (camelKey === 'border') {
          storedStyle[camelKey] = value as BorderStyle;
        } else if (camelKey === 'solidStyle') {
          storedStyle[camelKey] = value as SolidStyle;
        } else if (camelKey === 'transition') {
          storedStyle[camelKey] = value as TransitionStyle;
        } else if (camelKey === 'scaling') {
          storedStyle[camelKey] = value as ScalingSize;
        } else if (camelKey === 'surface') {
          storedStyle[camelKey] = value as SurfaceStyle;
        } else if (camelKey === 'neutral') {
          storedStyle.neutral = value as NeutralColor;
        } else if (camelKey === 'brand') {
          storedStyle.brand = value as BrandColor;
        } else if (camelKey === 'accent') {
          storedStyle.accent = value as BrandColor;
        }
      }
    });
    
    return storedStyle;
  } catch (e) {
    console.error('Error reading stored style values:', e);
    return {};
  }
}

export function ThemeProvider({ 
  children, 
  initialTheme = "system",
  neutral,
  brand,
  accent,
  solid,
  solidStyle,
  border,
  surface,
  transition,
  scaling
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("data-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (initialTheme !== "system") {
      setTheme(initialTheme);
    }
    setMounted(true);
  }, [initialTheme]);

  useEffect(() => {
    if (!mounted) return;

    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.setAttribute("data-theme", systemTheme);
      } else {
        setResolvedTheme(theme);
        document.documentElement.setAttribute("data-theme", theme);
      }
    };

    updateResolvedTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const storedValues = typeof window !== 'undefined' ? getStoredStyleValues() : {};
  
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
    setStyleState(prevStyle => ({
      ...prevStyle,
      theme: theme
    }));
  }, [theme]);

  const themeValue = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem("data-theme", newTheme);
      setTheme(newTheme);
    },
  };
  
  const camelToKebab = (str: string): string => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  };

  const styleValue: StyleProviderState = {
    ...style,
    setStyle: (newStyle: Partial<StyleOptions>) => {
      setStyleState(prevStyle => ({
        ...prevStyle,
        ...newStyle
      }));
      
      Object.entries(newStyle).forEach(([key, value]) => {
        if (value && key !== 'setStyle') {
          const attrName = `data-${camelToKebab(key)}`;
          document.documentElement.setAttribute(attrName, value.toString());
          localStorage.setItem(`data-${camelToKebab(key)}`, value.toString());
        }
      });
    },
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Object.entries(style).forEach(([key, value]) => {
        if (value && key !== 'setStyle') {
          document.documentElement.setAttribute(`data-${camelToKebab(key)}`, value.toString());
        }
      });
    }
  }, []);

  return (
    <ThemeProviderContext.Provider value={themeValue}>
      <StyleProviderContext.Provider value={styleValue}>
        {children}
      </StyleProviderContext.Provider>
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

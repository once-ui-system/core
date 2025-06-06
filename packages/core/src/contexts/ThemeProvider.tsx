"use client";

import { Schemes } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

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
  neutral: NeutralColor;
  brand: Schemes;
  accent: Schemes;
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
  brand?: Schemes;
  accent?: Schemes;
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
          storedStyle.brand = value as Schemes;
        } else if (camelKey === 'accent') {
          storedStyle.accent = value as Schemes;
        } else if (camelKey === 'solid') {
          storedStyle.solid = value as SolidType;
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
  // Try to get the initial theme from localStorage or system preference
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("data-theme") as Theme;
      if (savedTheme) {
        return savedTheme; // Can be 'system', 'light', or 'dark'
      }
      
      // If no saved theme, check if the document already has a data-theme attribute set
      const docTheme = document.documentElement.getAttribute("data-theme");
      if (docTheme === "dark" || docTheme === "light") {
        // Default to system if DOM has a theme but localStorage doesn't
        return "system";
      }
      
      return initialTheme;
    }
    return initialTheme;
  };

  // Helper to resolve a theme to light/dark (never system)
  const getResolvedThemeValue = (themeValue: Theme): "light" | "dark" => {
    if (themeValue === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return themeValue as "light" | "dark";
  };

  // Get the initial resolved theme (always light or dark, never system)
  const getInitialResolvedTheme = (): "light" | "dark" => {
    if (typeof window !== 'undefined') {
      // First check what's already in the DOM - the layout script should have set this correctly
      const docTheme = document.documentElement.getAttribute("data-theme");
      if (docTheme === "dark" || docTheme === "light") {
        return docTheme as "light" | "dark";
      }
      
      // Fallback to calculating it from the theme
      return getResolvedThemeValue(getInitialTheme());
    }
    return "light"; // Default for SSR
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(getInitialResolvedTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // On mount, we want to respect what's already in the DOM
    // The layout script has already set the correct data-theme attribute
    // We just need to make sure our state matches what's in the DOM
    
    // First, check what's actually in the DOM
    const docTheme = document.documentElement.getAttribute("data-theme");
    
    // Validate the DOM theme - it should NEVER be 'system'
    if (docTheme === "system") {
      // If somehow 'system' got into the DOM, fix it immediately
      const resolvedValue = getResolvedThemeValue("system");
      document.documentElement.setAttribute("data-theme", resolvedValue);
      console.log(`Fixed invalid 'system' in DOM, set to ${resolvedValue}`);
    }
    
    // Then check if there's a saved theme preference
    const savedTheme = localStorage.getItem("data-theme") as Theme;
    
    if (savedTheme) {
      // Update our state to match the saved preference
      setTheme(savedTheme);
      
      // Make sure our resolvedTheme state matches what's in the DOM
      // The DOM should have a valid light/dark value at this point
      const currentDocTheme = document.documentElement.getAttribute("data-theme");
      if (currentDocTheme === "dark" || currentDocTheme === "light") {
        setResolvedTheme(currentDocTheme as "light" | "dark");
      } else {
        // If DOM somehow doesn't have a valid theme, set it
        const resolvedValue = getResolvedThemeValue(savedTheme);
        document.documentElement.setAttribute("data-theme", resolvedValue);
        setResolvedTheme(resolvedValue);
      }
    } else {
      // If no saved theme, default to system and save it
      localStorage.setItem("data-theme", "system");
      setTheme("system");
      
      // Make sure the DOM has a valid light/dark value
      const resolvedValue = getResolvedThemeValue("system");
      document.documentElement.setAttribute("data-theme", resolvedValue);
      setResolvedTheme(resolvedValue);
    }
    
    // Log the current state for debugging
    console.log(`ThemeProvider mounted: theme=${theme}, resolvedTheme=${resolvedTheme}, DOM data-theme=${document.documentElement.getAttribute("data-theme")}`);
    setMounted(true);
  }, [initialTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolvedValue = mediaQuery.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", resolvedValue);
      setResolvedTheme(resolvedValue);
      console.log(`System theme changed to: ${resolvedValue}`);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);
  
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
    
    // Always ensure the DOM has the correct theme
    const currentResolvedTheme = getResolvedThemeValue(theme);
    if (document.documentElement.getAttribute("data-theme") !== currentResolvedTheme) {
      document.documentElement.setAttribute("data-theme", currentResolvedTheme);
    }
    
    console.log(`Theme updated: ${theme} (resolved: ${currentResolvedTheme})`);
  }, [theme, mounted]); // Only depend on theme, not mounted

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

  // Effect to update the DOM whenever the theme changes
  useEffect(() => {
    // Always use the resolved theme (never 'system') for the DOM
    const currentResolvedTheme = getResolvedThemeValue(theme);
    document.documentElement.setAttribute("data-theme", currentResolvedTheme);
    setResolvedTheme(currentResolvedTheme);
  }, [theme]);

  const themeValue = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      // Store the raw theme (can be 'system', 'light', or 'dark')
      localStorage.setItem("data-theme", newTheme);
      setTheme(newTheme);
      
      // The effect above will handle updating the DOM with the resolved theme
      const resolvedValue = getResolvedThemeValue(newTheme);
      console.log(`Theme preference set to ${newTheme}, DOM attribute set to ${resolvedValue}`);
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

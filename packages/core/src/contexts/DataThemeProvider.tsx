"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChartMode, ChartVariant } from "../modules/data";

interface ChartOptions {
  variant: ChartVariant;
  mode: ChartMode;
  height: number;
  axis: {
    stroke: string;
  };
  tick: {
    fill: string;
    fontSize: number;
    line: boolean;
  };
}

interface DataThemeState extends ChartOptions {
  setChartOptions: (options: Partial<ChartOptions>) => void;
}

interface DataThemeProviderProps extends Partial<ChartOptions> {
  children: ReactNode;
}

const defaultChartOptions: ChartOptions = {
  variant: "gradient",
  mode: "categorical",
  height: 24,
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

const DataThemeContext = createContext<DataThemeState>({
  ...defaultChartOptions,
  setChartOptions: () => null,
});

// Helper function to get stored chart options from localStorage
function getStoredChartOptions() {
  if (typeof window === "undefined") return {};

  try {
    const dataVizMode = localStorage.getItem("data-viz-style");

    if (dataVizMode) {
      return { mode: dataVizMode as ChartMode };
    }
    return {};
  } catch (e) {
    console.error("Error reading stored chart options:", e);
    return {};
  }
}

export function DataThemeProvider({
  children,
  variant,
  mode,
  height,
  axis,
  tick,
  ...rest
}: DataThemeProviderProps) {
  const camelToKebab = (str: string): string => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  };

  // Initialize with defaults and provided props for server-side rendering
  const [chartOptions, setChartOptionsState] = useState<ChartOptions>({
    ...defaultChartOptions,
    ...(variant ? { variant } : {}),
    ...(mode ? { mode } : {}),
    ...(height ? { height } : {}),
    ...(axis ? { axis } : {}),
    ...(tick ? { tick } : {}),
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedOptions = getStoredChartOptions();

    if (Object.keys(storedOptions).length > 0) {
      setChartOptionsState((prev) => ({
        ...prev,
        ...storedOptions,
      }));
    }

    setMounted(true);
  }, []);

  const applyDataVizAttribute = (mode: ChartMode, saveToLocalStorage = false) => {
    if (typeof document !== "undefined") {
      if (document.documentElement.hasAttribute("data-data-viz")) {
        document.documentElement.removeAttribute("data-data-viz");
      }

      document.documentElement.setAttribute("data-viz-style", mode);

      if (saveToLocalStorage) {
        localStorage.setItem("data-viz-style", mode);
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      applyDataVizAttribute(chartOptions.mode, false);
    }
  }, [chartOptions.mode, mounted]);

  const handleSetChartOptions = (newOptions: Partial<ChartOptions>) => {
    setChartOptionsState((prevOptions) => {
      const updatedOptions = {
        ...prevOptions,
        ...newOptions,
      };

      if (newOptions.mode && mounted && typeof window !== "undefined") {
        applyDataVizAttribute(newOptions.mode, true);
      }

      return updatedOptions;
    });
  };

  const value: DataThemeState = {
    ...chartOptions,
    setChartOptions: handleSetChartOptions,
  };

  return <DataThemeContext.Provider value={value}>{children}</DataThemeContext.Provider>;
}

export const useDataTheme = () => {
  const context = useContext(DataThemeContext);
  if (context === undefined) {
    throw new Error("useDataTheme must be used within a DataThemeProvider");
  }
  return context;
};

export { defaultChartOptions };

"use client";

import { cva } from "class-variance-authority";
import { forwardRef, useEffect, useState } from "react";
import { useDataTheme } from "../contexts/DataThemeProvider";
import {
  type BorderStyle,
  type NeutralColor,
  type ScalingSize,
  type SolidStyle,
  type SolidType,
  type SurfaceStyle,
  type TransitionStyle,
  useStyle,
} from "../contexts/ThemeProvider";
import type { ChartMode } from "../modules/data";
import { type Schemes, schemes } from "../types";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Scroller } from "./Scroller";
import { SegmentedControl } from "./SegmentedControl";
import { Text } from "./Text";
import { ThemeSwitcher } from "./ThemeSwitcher";

export interface StylePanelProps extends React.ComponentProps<typeof Column> {}

const shapes = ["sharp", "conservative", "playful", "rounded"] as const;

const colorOptions = {
  brand: [...schemes],
  accent: [...schemes],
  neutral: ["gray", "sand", "slate", "dusk", "mint", "rose"] as const,
};

export const styleOptionVariants = cva(
  "min-w-40 min-h-40 rounded-m-4 border border-solid border-transparent bg-transparent cursor-pointer transition-colors duration-micro-medium hover:bg-neutral-alpha-medium hover:border-neutral-alpha-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-alpha-strong",
  {
    variants: {
      selected: {
        true: "bg-neutral-alpha-strong border-neutral-alpha-strong",
        false: "",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export const colorSwatchVariants = cva("w-full h-full rounded-m border border-solid", {
  variants: {
    color: {
      slate: "bg-[var(--scheme-slate-500)] border-[var(--scheme-slate-700)]",
      gray: "bg-[var(--scheme-gray-500)] border-[var(--scheme-gray-700)]",
      rose: "bg-[var(--scheme-rose-500)] border-[var(--scheme-rose-700)]",
      mint: "bg-[var(--scheme-mint-500)] border-[var(--scheme-mint-700)]",
      dusk: "bg-[var(--scheme-dusk-500)] border-[var(--scheme-dusk-700)]",
      sand: "bg-[var(--scheme-sand-500)] border-[var(--scheme-sand-700)]",
      blue: "bg-[var(--scheme-blue-500)] border-[var(--scheme-blue-700)]",
      cyan: "bg-[var(--scheme-cyan-500)] border-[var(--scheme-cyan-700)]",
      indigo: "bg-[var(--scheme-indigo-500)] border-[var(--scheme-indigo-700)]",
      violet: "bg-[var(--scheme-violet-500)] border-[var(--scheme-violet-700)]",
      magenta: "bg-[var(--scheme-magenta-500)] border-[var(--scheme-magenta-700)]",
      pink: "bg-[var(--scheme-pink-500)] border-[var(--scheme-pink-700)]",
      yellow: "bg-[var(--scheme-yellow-500)] border-[var(--scheme-yellow-700)]",
      orange: "bg-[var(--scheme-orange-500)] border-[var(--scheme-orange-700)]",
      red: "bg-[var(--scheme-red-500)] border-[var(--scheme-red-700)]",
      moss: "bg-[var(--scheme-moss-500)] border-[var(--scheme-moss-700)]",
      green: "bg-[var(--scheme-green-500)] border-[var(--scheme-green-700)]",
      emerald: "bg-[var(--scheme-emerald-500)] border-[var(--scheme-emerald-700)]",
      aqua: "bg-[var(--scheme-aqua-500)] border-[var(--scheme-aqua-700)]",
      neutral: "bg-neutral-solid-medium border-neutral-alpha-strong",
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

export const StylePanel = forwardRef<HTMLDivElement, StylePanelProps>(
  ({ className, fillWidth = true, gap = "16", ...rest }, ref) => {
    const styleContext = useStyle();
    const { mode: chartMode, setChartOptions } = useDataTheme();

    const [mounted, setMounted] = useState(false);
    const [borderValue, setBorderValue] = useState<BorderStyle>("playful");
    const [brandValue, setBrandValue] = useState<Schemes | "custom">("blue");
    const [accentValue, setAccentValue] = useState<Schemes | "custom">("indigo");
    const [neutralValue, setNeutralValue] = useState<NeutralColor | "custom">("gray");
    const [solidValue, setSolidValue] = useState<SolidType>("contrast");
    const [solidStyleValue, setSolidStyleValue] = useState<SolidStyle>("flat");
    const [surfaceValue, setSurfaceValue] = useState<SurfaceStyle>("filled");
    const [scalingValue, setScalingValue] = useState<ScalingSize>("100");
    const [chartModeValue, setChartModeValue] = useState<ChartMode>("categorical");
    const [transitionValue, setTransitionValue] = useState<TransitionStyle>("all");

    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedSolid = localStorage.getItem("data-solid");
        const storedSolidStyle = localStorage.getItem("data-solid-style");

        if (storedSolid) setSolidValue(storedSolid as SolidType);
        if (storedSolidStyle) setSolidStyleValue(storedSolidStyle as SolidStyle);
      }
    }, []);

    useEffect(() => {
      setMounted(true);
      if (mounted) {
        setBorderValue(styleContext.border);
        setBrandValue(styleContext.brand);
        setAccentValue(styleContext.accent);
        setNeutralValue(styleContext.neutral);
        setSurfaceValue(styleContext.surface);
        setScalingValue(styleContext.scaling);
        setTransitionValue(styleContext.transition);
      }
      // Chart mode is handled separately
      setChartModeValue(chartMode);
    }, [styleContext, chartMode, mounted]);

    return (
      <Column fillWidth={fillWidth} gap={gap} ref={ref} className={className} {...rest}>
        <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
          <Text variant="heading-strong-s" onBackground="neutral-strong">
            Page
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Customize page theme
          </Text>
        </Column>
        <Column fillWidth border="neutral-alpha-medium" radius="l-4">
          <Flex
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            borderBottom="neutral-alpha-medium"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Theme
            </Text>
            <ThemeSwitcher />
          </Flex>
          <Flex horizontal="between" vertical="center" fillWidth paddingX="24" paddingY="16">
            <Text variant="label-default-s" onBackground="neutral-strong">
              Shape
            </Text>
            <Flex gap="4">
              {shapes.map((radius) => (
                <Flex
                  data-border={radius}
                  key={radius}
                  center
                  tabIndex={0}
                  className={styleOptionVariants({
                    selected: mounted && borderValue === radius,
                  })}
                  onClick={() => {
                    styleContext.setStyle({ border: radius as BorderStyle });
                    setBorderValue(radius as BorderStyle);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      styleContext.setStyle({ border: radius as BorderStyle });
                      setBorderValue(radius as BorderStyle);
                    }
                  }}
                >
                  <IconButton variant="ghost" size="m" aria-label={`Select ${radius} shape`}>
                    <div className={colorSwatchVariants({ color: "neutral" })} />
                  </IconButton>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Column>

        <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
          <Text variant="heading-strong-s" onBackground="neutral-strong">
            Color
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Customize color schemes
          </Text>
        </Column>
        <Column fillWidth border="neutral-alpha-medium" radius="l-4">
          <Flex
            borderBottom="neutral-alpha-medium"
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Flex textVariant="label-default-s" minWidth={3} onBackground="neutral-strong">
              Brand
            </Flex>
            <Scroller minWidth={0} fitWidth>
              {colorOptions.brand.map((color) => (
                <Flex
                  marginRight="2"
                  key={color}
                  center
                  tabIndex={0}
                  className={styleOptionVariants({
                    selected: mounted && brandValue === color,
                  })}
                  onClick={() => {
                    styleContext.setStyle({ brand: color as Schemes });
                    setBrandValue(color as Schemes);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      styleContext.setStyle({ brand: color as Schemes });
                      setBrandValue(color as Schemes);
                    }
                  }}
                >
                  <IconButton variant="ghost" size="m" aria-label={`Select ${color} brand color`}>
                    <div
                      className={colorSwatchVariants({
                        color: color as Schemes,
                      })}
                    />
                  </IconButton>
                </Flex>
              ))}
            </Scroller>
          </Flex>

          <Flex
            borderBottom="neutral-alpha-medium"
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Flex textVariant="label-default-s" minWidth={3} onBackground="neutral-strong">
              Accent
            </Flex>
            <Scroller minWidth={0} fitWidth>
              {colorOptions.accent.map((color) => (
                <Flex
                  marginRight="2"
                  key={color}
                  center
                  tabIndex={0}
                  className={styleOptionVariants({
                    selected: mounted && accentValue === color,
                  })}
                  onClick={() => {
                    styleContext.setStyle({ accent: color as Schemes });
                    setAccentValue(color as Schemes);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      styleContext.setStyle({ accent: color as Schemes });
                      setAccentValue(color as Schemes);
                    }
                  }}
                >
                  <IconButton variant="ghost" size="m" aria-label={`Select ${color} accent color`}>
                    <div
                      className={colorSwatchVariants({
                        color: color as Schemes,
                      })}
                    />
                  </IconButton>
                </Flex>
              ))}
            </Scroller>
          </Flex>

          <Flex
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Flex textVariant="label-default-s" minWidth={3} onBackground="neutral-strong">
              Neutral
            </Flex>
            <Scroller minWidth={0} fitWidth>
              {colorOptions.neutral.map((color) => (
                <Flex
                  marginRight="2"
                  key={color}
                  center
                  tabIndex={0}
                  className={styleOptionVariants({
                    selected: mounted && neutralValue === color,
                  })}
                  onClick={() => {
                    styleContext.setStyle({ neutral: color as NeutralColor });
                    setNeutralValue(color as NeutralColor);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      styleContext.setStyle({ neutral: color as NeutralColor });
                      setNeutralValue(color as NeutralColor);
                    }
                  }}
                >
                  <IconButton variant="ghost" size="m" aria-label={`Select ${color} neutral color`}>
                    <div
                      className={colorSwatchVariants({
                        color: color as NeutralColor,
                      })}
                    />
                  </IconButton>
                </Flex>
              ))}
            </Scroller>
          </Flex>
        </Column>

        <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
          <Text variant="heading-strong-s" onBackground="neutral-strong">
            Solid style
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Customize the appearance of interactive elements
          </Text>
        </Column>
        <Column fillWidth border="neutral-alpha-medium" radius="l-4">
          <Flex
            borderBottom="neutral-alpha-medium"
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Style
            </Text>
            <SegmentedControl
              maxWidth={22}
              minWidth={0}
              buttons={[
                {
                  size: "l",
                  label: (
                    <Flex vertical="center" gap="12">
                      <Flex
                        data-solid="color"
                        border="brand-strong"
                        solid="brand-weak"
                        width="24"
                        height="24"
                        radius="s"
                      />
                      Color
                    </Flex>
                  ),
                  value: "color",
                },
                {
                  size: "l",
                  label: (
                    <Flex vertical="center" gap="12">
                      <Flex
                        data-solid="inverse"
                        border="brand-strong"
                        solid="brand-strong"
                        width="24"
                        height="24"
                        radius="s"
                      />
                      Inverse
                    </Flex>
                  ),
                  value: "inverse",
                },
                {
                  size: "l",
                  label: (
                    <Flex vertical="center" gap="12">
                      <Flex
                        data-solid="contrast"
                        border="brand-strong"
                        solid="brand-strong"
                        width="24"
                        height="24"
                        radius="s"
                      />
                      Contrast
                    </Flex>
                  ),
                  value: "contrast",
                },
              ]}
              onToggle={(value) => {
                styleContext.setStyle({ solid: value as SolidType });
                setSolidValue(value as SolidType);
                localStorage.setItem("data-solid", value);
              }}
              selected={mounted ? solidValue : undefined}
              defaultSelected="contrast"
            />
          </Flex>
          <Flex
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Effect
            </Text>
            <SegmentedControl
              maxWidth={22}
              minWidth={0}
              buttons={[
                {
                  size: "l",
                  label: (
                    <Flex vertical="center" gap="12">
                      <Flex
                        border="brand-strong"
                        solid="brand-weak"
                        width="24"
                        height="24"
                        radius="s"
                      />
                      Flat
                    </Flex>
                  ),
                  value: "flat",
                },
                {
                  size: "l",
                  label: (
                    <Flex vertical="center" gap="12">
                      <Flex
                        border="brand-strong"
                        className="shadow-[inset_0_calc(-1*var(--static-space-8))_var(--static-space-8)_var(--brand-solid-strong)]"
                        solid="brand-weak"
                        width="24"
                        height="24"
                        radius="s"
                      />
                      Plastic
                    </Flex>
                  ),
                  value: "plastic",
                },
              ]}
              onToggle={(value) => {
                styleContext.setStyle({ solidStyle: value as SolidStyle });
                setSolidStyleValue(value as SolidStyle);
                localStorage.setItem("data-solid-style", value);
              }}
              selected={mounted ? solidStyleValue : undefined}
              defaultSelected="flat"
            />
          </Flex>
        </Column>
        <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
          <Text variant="heading-strong-s" onBackground="neutral-strong">
            Advanced
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Customize advanced styling options
          </Text>
        </Column>
        <Column fillWidth border="neutral-alpha-medium" radius="l-4">
          <Flex
            borderBottom="neutral-alpha-medium"
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Surface
            </Text>
            <SegmentedControl
              maxWidth={22}
              minWidth={0}
              onToggle={(value) => {
                styleContext.setStyle({ surface: value as SurfaceStyle });
                setSurfaceValue(value as SurfaceStyle);
              }}
              selected={mounted ? surfaceValue : undefined}
              defaultSelected="filled"
              buttons={[
                {
                  size: "l",
                  label: "Filled",
                  value: "filled",
                },
                {
                  size: "l",
                  label: "Translucent",
                  value: "translucent",
                },
              ]}
            />
          </Flex>
          <Flex
            borderBottom="neutral-alpha-medium"
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Scaling
            </Text>
            <SegmentedControl
              maxWidth={22}
              minWidth={0}
              onToggle={(value) => {
                styleContext.setStyle({ scaling: value as ScalingSize });
                setScalingValue(value as ScalingSize);
              }}
              selected={mounted ? scalingValue : undefined}
              defaultSelected="100"
              buttons={[
                {
                  size: "l",
                  label: "90",
                  value: "90",
                },
                {
                  size: "l",
                  label: "95",
                  value: "95",
                },
                {
                  size: "l",
                  label: "100",
                  value: "100",
                },
                {
                  size: "l",
                  label: "105",
                  value: "105",
                },
                {
                  size: "l",
                  label: "110",
                  value: "110",
                },
              ]}
            />
          </Flex>
          <Flex
            borderBottom="neutral-alpha-medium"
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Data Style
            </Text>
            <SegmentedControl
              maxWidth={22}
              minWidth={0}
              onToggle={(value) => {
                setChartOptions({ mode: value as ChartMode });
                setChartModeValue(value as ChartMode);
              }}
              selected={mounted ? chartModeValue : undefined}
              defaultSelected="categorical"
              buttons={[
                {
                  size: "l",
                  label: "Categorical",
                  value: "categorical",
                },
                {
                  size: "l",
                  label: "Divergent",
                  value: "divergent",
                },
                {
                  size: "l",
                  label: "Sequential",
                  value: "sequential",
                },
              ]}
            />
          </Flex>
          <Flex
            horizontal="between"
            vertical="center"
            fillWidth
            paddingX="24"
            paddingY="16"
            gap="24"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Transition
            </Text>
            <SegmentedControl
              maxWidth={22}
              minWidth={0}
              onToggle={(value) => {
                styleContext.setStyle({ transition: value as TransitionStyle });
                setTransitionValue(value as TransitionStyle);
              }}
              selected={mounted ? transitionValue : undefined}
              defaultSelected="all"
              buttons={[
                {
                  size: "l",
                  label: "All",
                  value: "all",
                },
                {
                  size: "l",
                  label: "Micro",
                  value: "micro",
                },
                {
                  size: "l",
                  label: "Macro",
                  value: "macro",
                },
                {
                  size: "l",
                  label: "None",
                  value: "none",
                },
              ]}
            />
          </Flex>
        </Column>
      </Column>
    );
  },
);

StylePanel.displayName = "StylePanel";

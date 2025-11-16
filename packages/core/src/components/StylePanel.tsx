"use client";

import { forwardRef, useState, useEffect } from "react";
import { Flex, Text, SegmentedControl, IconButton, Scroller, Column, ThemeSwitcher } from ".";
import {
  BorderStyle,
  NeutralColor,
  ScalingSize,
  SolidStyle,
  SolidType,
  SurfaceStyle,
  TransitionStyle,
  useStyle,
} from "../contexts/ThemeProvider";
import { useDataTheme } from "../contexts/DataThemeProvider";
import styles from "./StylePanel.module.scss";
import classNames from "classnames";
import { Schemes, schemes } from "../types";
import { ChartMode } from "@/modules/data";

interface StylePanelProps extends React.ComponentProps<typeof Flex> {
  style?: React.CSSProperties;
  className?: string;
}

const shapes = ["sharp", "conservative", "playful", "rounded"];

const colorOptions = {
  brand: [...schemes],
  accent: [...schemes],
  neutral: ["sand", "gray", "slate"],
};

const StylePanel = forwardRef<HTMLDivElement, StylePanelProps>(({ ...rest }, ref) => {
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
    <Column fillWidth gap="16" ref={ref} {...rest}>
      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Page</Text>
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
          <Text variant="label-default-s">Theme</Text>
          <ThemeSwitcher />
        </Flex>
        <Flex horizontal="between" vertical="center" fillWidth paddingX="24" paddingY="16">
          <Text variant="label-default-s">Shape</Text>
          <Flex gap="4">
            {shapes.map((radius, index) => (
              <Flex
                data-border={shapes[index]}
                key={radius}
                center
                tabIndex={0}
                className={classNames(
                  styles.select,
                  mounted && borderValue === radius ? styles.selected : "",
                )}
                onClick={() => {
                  styleContext.setStyle({ border: radius as BorderStyle });
                  setBorderValue(radius as BorderStyle);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={classNames(styles.neutral, styles.swatch)}></div>
                </IconButton>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Column>

      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Color</Text>
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
          <Flex textVariant="label-default-s" minWidth={3}>
            Brand
          </Flex>
          <Scroller minWidth={0} fitWidth>
            {colorOptions.brand.map((color, index) => (
              <Flex
                marginRight="2"
                key={color}
                center
                tabIndex={0}
                className={classNames(
                  styles.select,
                  mounted && brandValue === color ? styles.selected : "",
                )}
                onClick={() => {
                  styleContext.setStyle({ brand: color as Schemes });
                  setBrandValue(color as Schemes);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={`${styles[color]} ${styles.swatch}`}></div>
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
          <Flex textVariant="label-default-s" minWidth={3}>
            Accent
          </Flex>
          <Scroller minWidth={0} fitWidth>
            {colorOptions.accent.map((color, index) => (
              <Flex
                marginRight="2"
                key={color}
                center
                tabIndex={0}
                className={classNames(
                  styles.select,
                  mounted && accentValue === color ? styles.selected : "",
                )}
                onClick={() => {
                  styleContext.setStyle({ accent: color as Schemes });
                  setAccentValue(color as Schemes);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={`${styles[color]} ${styles.swatch}`}></div>
                </IconButton>
              </Flex>
            ))}
          </Scroller>
        </Flex>

        <Flex horizontal="between" vertical="center" fillWidth paddingX="24" paddingY="16" gap="24">
          <Flex textVariant="label-default-s" minWidth={3}>
            Neutral
          </Flex>
          <Scroller minWidth={0} fitWidth>
            {colorOptions.neutral.map((color, index) => (
              <Flex
                marginRight="2"
                key={color}
                center
                tabIndex={0}
                className={classNames(
                  styles.select,
                  mounted && neutralValue === color ? styles.selected : "",
                )}
                onClick={() => {
                  styleContext.setStyle({ neutral: color as NeutralColor });
                  setNeutralValue(color as NeutralColor);
                }}
              >
                <IconButton variant="ghost" size="m">
                  <div className={`${styles[color]} ${styles.swatch}`}></div>
                </IconButton>
              </Flex>
            ))}
          </Scroller>
        </Flex>
      </Column>

      <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
        <Text variant="heading-strong-s">Solid style</Text>
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
          <Text variant="label-default-s">Style</Text>
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
        <Flex horizontal="between" vertical="center" fillWidth paddingX="24" paddingY="16" gap="24">
          <Text variant="label-default-s">Effect</Text>
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
                      style={{
                        boxShadow:
                          "inset 0 calc(-1 * var(--static-space-8)) var(--static-space-8) var(--brand-solid-strong)",
                      }}
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
        <Text variant="heading-strong-s">Advanced</Text>
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
          <Text variant="label-default-s">Surface</Text>
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
          <Text variant="label-default-s">Scaling</Text>
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
          <Text variant="label-default-s">Data Style</Text>
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
        <Flex horizontal="between" vertical="center" fillWidth paddingX="24" paddingY="16" gap="24">
          <Text variant="label-default-s">Transition</Text>
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
});

StylePanel.displayName = "StylePanel";
export { StylePanel };

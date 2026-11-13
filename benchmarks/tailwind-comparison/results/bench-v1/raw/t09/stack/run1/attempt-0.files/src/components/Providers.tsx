"use client";

import {
  DataThemeProvider,
  IconProvider,
  ThemeProvider,
  ToastProvider,
  type BorderStyle,
  type NeutralColor,
  type ScalingSize,
  type Schemes,
  type SolidStyle,
  type SolidType,
  type SurfaceStyle,
  type Theme,
  type TransitionStyle,
} from "@once-ui-system/core";
import type { ChartMode, ChartVariant } from "@once-ui-system/core/data";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { iconLibrary } from "../resources/icons";
import { dataStyle, style } from "../resources/once-ui.config";
import { OrgProvider } from "./OrgProvider";
import { UserProvider } from "./UserProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme={style.theme as Theme}
        defaultTheme={style.defaultTheme as Theme}
        brand={style.brand as Schemes | "custom"}
        accent={style.accent as Schemes | "custom"}
        neutral={style.neutral as NeutralColor | "custom"}
        brandScale={style.brandScale}
        accentScale={style.accentScale}
        neutralScale={style.neutralScale}
        solid={style.solid as SolidType}
        solidStyle={style.solidStyle as SolidStyle}
        border={style.border as BorderStyle}
        surface={style.surface as SurfaceStyle}
        transition={style.transition as TransitionStyle}
        scaling={style.scaling as ScalingSize}
      >
        <DataThemeProvider
          variant={dataStyle.variant as ChartVariant}
          mode={dataStyle.mode as ChartMode}
          height={dataStyle.height}
          axis={{
            stroke: dataStyle.axis.stroke,
          }}
          tick={{
            fill: dataStyle.tick.fill,
            fontSize: dataStyle.tick.fontSize,
            line: dataStyle.tick.line,
          }}
        >
          <ToastProvider>
            <IconProvider icons={iconLibrary}>
              <UserProvider>
                <OrgProvider>{children}</OrgProvider>
              </UserProvider>
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}

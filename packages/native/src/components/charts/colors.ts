import { useCallback, useMemo } from "react";
import { resolveTokens, type StyleSettings } from "../../theme/resolve";
import { useTheme } from "../../theme/ThemeProvider";

const RAW_COLOR = /^(#|(rgba?|hsla?)\()|^(transparent|white|black)$/i;

/**
 * Core's `cssColor(value, "data-")` against the theme: `"blue"` is
 * `--data-blue`, any other token name (`"brand-solid-strong"`) is that token,
 * a raw colour passes through. `mode` re-resolves the `data-*` tokens with
 * core's `data-viz-style` layers, so `sequential` draws in brand shades.
 */
export function useDataColor(mode?: string): (value: string) => string {
  const theme = useTheme();
  const tokens = useMemo(
    () =>
      mode && mode !== "categorical"
        ? resolveTokens({ ...theme.settings, vizStyle: mode } as StyleSettings, theme.width)
        : theme.tokens,
    [theme, mode],
  );
  return useCallback(
    (value: string) => {
      if (RAW_COLOR.test(value.trim())) return value;
      const token = tokens[`data-${value}`] ?? tokens[value];
      return typeof token === "string" && token.startsWith("#") ? token : theme.color(value);
    },
    [tokens, theme],
  );
}

import { createTheme, type MantineColorsTuple } from "@mantine/core";

/**
 * Lumen brand: orange #E8590C. Shade 6 is the exact brand colour and
 * `primaryShade` points at it in both colour schemes, so filled buttons,
 * links and focus rings all resolve to the brand.
 */
const brand: MantineColorsTuple = [
  "#FFF4EC",
  "#FFE5D3",
  "#FFC9A6",
  "#FFA871",
  "#F58440",
  "#EE6C23",
  "#E8590C",
  "#C94A07",
  "#A53D07",
  "#7F2F06",
];

/** Warm stone-grey neutral, light to dark. Used for the light scheme. */
const stone: MantineColorsTuple = [
  "#FAF9F7",
  "#F4F2EF",
  "#E8E5E0",
  "#D8D4CD",
  "#BDB8AF",
  "#A39D93",
  "#79736A",
  "#57524A",
  "#3D3934",
  "#292622",
];

/**
 * Mantine's dark colour scheme reads surfaces, borders and text from the
 * `dark` scale (0 = lightest text, 9 = deepest surface), so a warm stone
 * scale here makes the whole dark theme warm.
 */
const darkStone: MantineColorsTuple = [
  "#E7E3DC", // text
  "#CBC6BD",
  "#A29C91", // dimmed
  "#7E786E", // placeholder
  "#4A453E", // borders
  "#3C3833", // hover
  "#2F2C28", // surfaces (cards, inputs)
  "#242220", // body background
  "#1B1917",
  "#131211",
];

const RADIUS = "4px";

/*
 * This file is imported by the server layout, so it must not call statics
 * such as `Button.extend()` (those live on client components). Component
 * defaults are plain `{ defaultProps }` objects instead.
 */
export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 6 },
  colors: {
    brand,
    dark: darkStone,
    gray: stone,
  },

  // The brand orange is mid-luminance: let Mantine pick black or white text
  // for filled controls, whichever contrasts better (dark text on #E8590C).
  autoContrast: true,
  luminanceThreshold: 0.35,

  // Focus ring follows the primary colour (brand) for keyboard users.
  focusRing: "auto",

  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: "700",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: "3.25rem", lineHeight: "1.1" },
      h2: { fontSize: "2.25rem", lineHeight: "1.2" },
      h3: { fontSize: "1.5rem", lineHeight: "1.3" },
    },
  },

  // 4px corners everywhere a radius is not set explicitly.
  defaultRadius: "xs",
  radius: {
    xs: RADIUS,
    sm: RADIUS,
    md: RADIUS,
    lg: RADIUS,
    xl: RADIUS,
  },

  components: {
    Button: { defaultProps: { radius: "xs" } },
    ActionIcon: { defaultProps: { radius: "xs" } },
    TextInput: { defaultProps: { radius: "xs" } },
    PasswordInput: { defaultProps: { radius: "xs" } },
    Textarea: { defaultProps: { radius: "xs" } },
    Select: { defaultProps: { radius: "xs" } },
    NativeSelect: { defaultProps: { radius: "xs" } },
    Card: { defaultProps: { radius: "xs" } },
    Paper: { defaultProps: { radius: "xs" } },
    Menu: { defaultProps: { radius: "xs" } },
    Accordion: { defaultProps: { radius: "xs" } },
    SegmentedControl: { defaultProps: { radius: "xs" } },
    Badge: { defaultProps: { radius: "xs" } },
    Anchor: { defaultProps: { underline: "hover" } },
    Container: { defaultProps: { size: "lg" } },
    Table: { defaultProps: { verticalSpacing: "sm" } },
  },
});

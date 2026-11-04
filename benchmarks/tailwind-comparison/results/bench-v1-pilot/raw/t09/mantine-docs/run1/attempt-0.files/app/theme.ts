import {
  Accordion,
  Anchor,
  Button,
  Card,
  Container,
  Input,
  Menu,
  Paper,
  Switch,
  Table,
  Title,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

/**
 * Lumen brand: #E8590C sits at shade 6 of the `lumen` tuple and is used as the
 * primary colour for filled buttons, links and focus rings.
 */
const lumen: MantineColorsTuple = [
  "#fff4ec",
  "#ffe6d4",
  "#fdcaa6",
  "#fbab74",
  "#f98f49",
  "#ee7424",
  "#E8590C",
  "#c94a08",
  "#a63d06",
  "#7f2e04",
];

/**
 * Warm stone grey. Mantine's `dark` tuple drives the dark theme surfaces
 * (index 7 = body background, 6 = cards, 4 = borders, 0 = text), and `gray`
 * drives the light theme surfaces. Both are replaced with stone values.
 */
const stoneDark: MantineColorsTuple = [
  "#e7e5e4", // 0 text
  "#d6d3d1", // 1
  "#a8a29e", // 2 dimmed text
  "#78716c", // 3
  "#57534e", // 4 borders / default button borders
  "#44403c", // 5 hover surfaces
  "#292524", // 6 cards / inputs
  "#1c1917", // 7 body
  "#151211", // 8
  "#0c0a09", // 9
];

const stoneGray: MantineColorsTuple = [
  "#fafaf9",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#1c1917",
];

const BRAND_FONT_BODY = 'ui-sans-serif, system-ui, sans-serif';
const BRAND_FONT_HEADING = 'Georgia, "Times New Roman", serif';

export const theme = createTheme({
  primaryColor: "lumen",
  primaryShade: { light: 6, dark: 6 },
  colors: {
    lumen,
    dark: stoneDark,
    gray: stoneGray,
  },
  // White on #E8590C is ~3.9:1; dark stone text on the brand colour is ~5:1.
  autoContrast: true,
  luminanceThreshold: 0.4,
  white: "#fafaf9",
  black: "#1c1917",

  fontFamily: BRAND_FONT_BODY,
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  headings: {
    fontFamily: BRAND_FONT_HEADING,
    fontWeight: "700",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: "clamp(2.25rem, 5vw + 1rem, 3.75rem)", lineHeight: "1.1" },
      h2: { fontSize: "clamp(1.75rem, 3vw + 1rem, 2.5rem)", lineHeight: "1.2" },
      h3: { fontSize: "1.5rem", lineHeight: "1.3" },
      h4: { fontSize: "1.25rem", lineHeight: "1.35" },
      h5: { fontSize: "1.125rem", lineHeight: "1.4" },
      h6: { fontSize: "1rem", lineHeight: "1.4" },
    },
  },

  // 4px corner radius everywhere.
  defaultRadius: 4,
  radius: {
    xs: "2px",
    sm: "4px",
    md: "4px",
    lg: "4px",
    xl: "4px",
  },

  focusRing: "auto",
  cursorType: "pointer",

  components: {
    Button: Button.extend({
      defaultProps: { radius: 4 },
    }),
    Input: Input.extend({
      defaultProps: { radius: 4 },
    }),
    Card: Card.extend({
      defaultProps: { radius: 4, withBorder: true, padding: "lg" },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: 4 },
    }),
    Menu: Menu.extend({
      defaultProps: { radius: 4 },
    }),
    Accordion: Accordion.extend({
      defaultProps: { radius: 4 },
    }),
    Switch: Switch.extend({
      defaultProps: { radius: 4 },
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: "sm" },
    }),
    Anchor: Anchor.extend({
      defaultProps: { underline: "hover" },
    }),
    Title: Title.extend({
      defaultProps: { c: "var(--mantine-color-text)" },
    }),
    Container: Container.extend({
      defaultProps: { size: "lg" },
    }),
  },
});

/**
 * Link colour needs more luminance on the dark surface to keep AA contrast,
 * so links use the lighter brand shade in dark mode and the deeper one in light.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-anchor": "#c94a08",
    "--mantine-color-body": "#fafaf9",
  },
  dark: {
    "--mantine-color-anchor": "#fb8c4a",
    "--mantine-color-body": "#1c1917",
  },
});

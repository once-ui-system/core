# App shell (@once-ui-system/native)

The providers at the root, safe areas, a screen header and a bottom tab bar, for a new app or its navigation

This file is complete for this task: the rules (all of `rules.md`), the props of every component below, their mixins and types, the hooks, every gotcha for this task, the quality bar and a gold example. Write the screen from it; reading the rules, catalog, gotchas or examples again only adds cost. Open `components/<Name>.json` only for a component not listed here, and then every one you need in a single step.

## Rules

`@once-ui-system/native` has the same component names, props and design tokens as `@once-ui-system/core` 3.0, so a phone screen reads like the web page it mirrors. These rules cover what is different on a phone. Each shows the correct form first.

## App setup

1. The root of the app holds the providers, once: `SafeAreaProvider` (from `react-native-safe-area-context`, included in Expo), then `ThemeProvider` with the screen's insets, then `ToastProvider`. In Expo Router this is `app/_layout.tsx`.

```tsx
import { Stack } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeProvider, ToastProvider } from "@once-ui-system/native";

function Themed({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider insets={useSafeAreaInsets()} brand="orange" neutral="sand" solid="color">
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Themed>
        <Stack screenOptions={{ headerShown: false }} />
      </Themed>
    </SafeAreaProvider>
  );
}
```

2. `ThemeProvider` takes the web app's style options under the same names and defaults (`theme`, `brand`, `accent`, `neutral`, `solid`, `solidStyle`, `border`, `surface`, `scaling`, `density`). When the app also has a web build, copy them from its `once-ui.config` so both look the same. `theme="system"` (the default) follows the device.
3. Fonts the app loads (with `expo-font`) go to `ThemeProvider fonts={{ heading, body, label, code }}` by family name. Without them the platform font is used.
4. Keep the content and data a screen shows (copy, lists, prices) in a plain module both the web and the phone app import. Only the screens differ.

## Screens

5. A screen is a `Column fill background="page"` with `safeArea` on the edges the screen touches: `safeArea={["top"]}` under no header, and the bottom edge on the view that sits on the home indicator (a tab bar, a bottom action row).
6. Content taller than the phone scrolls in React Native's `ScrollView`, with the Once UI layout inside it. Long or growing lists use `FlatList`, its `renderItem` returning Once UI rows. Pull to refresh is `RefreshControl` with `tintColor={theme.color("neutral-on-background-weak")}`.

```tsx
<Column fill background="page" safeArea={["top"]}>
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <Column paddingX="20" paddingY="24" gap="24">…</Column>
  </ScrollView>
</Column>
```

7. Forms sit in `KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}` so the keyboard does not cover the field being typed in.
8. Navigation is the app's router (Expo Router or React Navigation). `href` on `Button`, `Card` and `Tag` opens a URL outside the app; a route inside it is `router.push("/orders")` in `onPress`.

## Layout

9. `Row` and `Column` as on the web, with the same shorthands: `fill`, `fillWidth`, `center`, `horizontal`/`vertical` (`start`, `center`, `end`, `between`). `Flex` is a row by default, as on the web; use it only for a direction that changes at a breakpoint.
10. `gap`, `padding` and `margin` take spacing tokens: "0", "1", "2", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "104", "128", "160", or `xs`–`xl`. A screen's side padding is "20" (or "16"); gaps inside a section "8"–"16", between sections "24"–"32".
11. A number on a size or offset prop is in points (`maxWidth={320}`, `height={48}`); tokens (`width="40"`) and `"50%"` work too. CSS lengths (`vh`, `calc()`) do not exist here.
12. Breakpoint props (`xl`, `l`, `m`, `s`, `xs`) work on `Flex`, `Row`, `Column` and `Card` as on the web, by window width: use them for tablets (`m={{ direction: "column" }}`), not to tell phones apart.
13. React Native has no single-side borders: `borderTop`, `borderBottom`, `borderX` are type errors. A divider is `<Line />` between the views. `position` is `relative`, `absolute` or `static`; there is no `fixed` or `sticky`, so a bar that stays put sits outside the `ScrollView`.
14. `radius` does not clip children: add `overflow="hidden"` when an image or a filled child must follow the corners.

## Surfaces and color

15. A static panel is `<Column background="surface" border="neutral-alpha-weak" radius="l" padding="16">`. `Card` is for something pressable (`onPress`); `selected` marks the picked one.
16. Colors are semantic tokens (`{scheme}-{weight}`, `-alpha-` for tints): `background="brand-alpha-weak"`, `onBackground="neutral-weak"`. Never hex or rgb. A React Native primitive you style yourself reads them with `useTheme()`: `theme.color("brand-solid-strong")`, `theme.space("16")`, `theme.radius("l")`.

## Text

17. Every string sits in `Text` or `Heading`. `textVariant` picks the preset (`body-default-m`, `label-strong-s`, `heading-strong-l`, `display-strong-xs`); `onBackground` the color: `neutral-strong` (default), `neutral-medium` for secondary lines, `neutral-weak` for hints.
18. A screen title is `Heading textVariant="heading-strong-xl"`, a section title `heading-strong-m`, a big number `display-strong-s`. Phones need fewer sizes than the web: two or three per screen.

## Components

19. Use the component, never a hand-built copy: `Button`, `IconButton`, `ToggleButton`, `Tag`, `Avatar`, `Switch`, `Checkbox`, `Input`, `Select`, `SegmentedControl`, `ProgressBar`, `Dialog`, `Feedback`, `Skeleton`. Their props are core 3.0's: state is `X` / `defaultX` / `onXChange` (`checked` + `onCheckedChange`, `value` + `onValueChange`, `open` + `onOpenChange`), color is `tone`, look is `variant`, names are `aria-label`.
20. Press handlers are `onPress` (React Native's); `onClick` works too, so web code moves over unchanged. Pressed states replace hover, and small controls take taps from 44pt around them on their own: never pad a control to make it tappable.
21. `Dialog` opens as a bottom sheet (`variant="center"` for a card in the middle), and `Select` opens its options in one. A confirm step is a `Dialog` with two `Button`s in `footer`.
22. Icons come from the Icons list in this file, by name: `<Icon name="star" />`, `prefixIcon="plus"`. Brand marks and other icons are added with `IconProvider`; never guess a name or cast one with `as IconName`.
23. Only the components listed in `catalog.json` exist here. Core's web-only parts have no import: no `Form`, `Setting`, `Table`, `Scroller`, `NavItem`, `HoverCard`, `SmartLink` or effects. The gotchas name what to write instead.
24. A loading screen shows `Skeleton`s in the shape of what is coming, not a lone `Spinner`. Empty lists show an icon, a line of text and the action that fills them.

## Before writing

25. Read the bundle for the screen, then write. Validate with the app's TypeScript check: a prop that is not in this file is a type error, not a style to try.

## Components

### ThemeProvider
Root provider: core's style options with core's defaults (theme, brand, neutral, solid, border, scaling…), plus fonts and the screen's safe-area insets
- theme?: Theme = "system" — `"system"` follows the device's appearance.
- brand?, accent?: Schemes
- neutral?: NeutralColor
- solid?: SolidType
- solidStyle?: SolidStyle
- border?: BorderStyle
- surface?: SurfaceStyle
- scaling?: ScalingSize — Left out, `density` picks it: compact 95, normal 100, spacious 105.
- density?: Density — The size Button, IconButton, Tag, Checkbox, Switch and RadioGroup take when given none: s when `"compact"`, m when `"normal"` (the default), l when `"spacious"`.
- bodySize?: BodySize
- bodyLineHeight?: BodyLineHeight
- desktopSize?, tabletSize?, mobileSize?: DeviceFontSize
- fonts?: FontFamilies — Font families the app has loaded; the platform font is used for any left out.
- insets?: Insets = NO_INSETS — Safe-area insets in points, for `Dialog`, toasts and `Flex`'s `safeArea`.
- children: ReactNode

### ToastProvider
Shows toasts stacked at the bottom of the screen, newest last.
- children: ReactNode

### Column
Vertical flex layout — default direction column
Mixins: FlexProps, SpacingProps.
Also takes React Native's ViewProps.

### Row
Horizontal flex layout — default direction row
Mixins: FlexProps, SpacingProps.
Also takes React Native's ViewProps.

### Heading
A heading, heading-strong-l by default and announced as a header
Mixins: SpacingProps, TextProps.
Also takes React Native's TextProps.
- textVariant?: TextVariant = "heading-strong-l" — The typography preset, `${family}-${weight}-${size}` (`"body-default-m"`, `"heading-strong-l"`), as in core 3.0 (2.x and the first native preview called it `variant`).

### Text
Body, label and display text with variant, weight and colour tokens
Mixins: SpacingProps.
Also takes React Native's TextProps.
- textVariant?: TextVariant = "body-default-m" — The typography preset, `${family}-${weight}-${size}` (`"body-default-m"`, `"heading-strong-l"`), as in core 3.0 (2.x and the first native preview called it `variant`).
- family?: TextType — Swaps the preset's family and keeps its size and weight, as in core.
- weight?: TextWeight — Swaps the preset's weight and keeps the rest, as in core.
- onBackground?, onSolid?: `${ColorScheme}-${ColorWeight}`
- align?: "left" | "center" | "right" | "justify"
- truncate?: boolean — One line, ending in an ellipsis.
- style?: TextStyle | TextStyle[]

### IconButton
A square button holding one icon.
Also takes React Native's PressableProps.
- icon?: IconName = "refresh"
- size?: TShirtSizes
- variant?: ButtonVariant = "primary" — How the button looks.
- tone?: Tone — Which palette the button draws in: the solid fill of a `primary` button, the icon of the others.
- corners?: ButtonCorners — Rounds only these corners; `"none"` squares them all.
- rounded?: boolean = false
- loading?: boolean = false
- disabled?: boolean = false — Whether the press behavior is disabled.
- aria-label?: string — The button's accessible name, as core's `aria-label`; mapped to `accessibilityLabel`.
- tooltip?: ReactNode — Core also reads a plain-text `tooltip`; there is no hover here, so it only names the button.
- tooltipPosition?: "top" | "bottom" | "left" | "right" — Accepted for core's JSX; there is no tooltip to place on a touch screen.
- onClick?: () => void — Core's name for `onPress`, so the same JSX works on both; `onPress` wins.
- href?: string — Opens this URL with `Linking`, as core's `href` makes the button a link.
- children?: ReactNode
- style?: ViewStyle

### Card
Pressable surface (onPress), with every Flex prop; a static panel is a Column with background, border and radius instead
Mixins: FlexProps, SpacingProps.
Also takes React Native's ViewProps.
- children?: ReactNode
- onPress?: () => void — Makes the card pressable.
- onClick?: () => void — The action to perform when this `View` is clicked on by a non-touch click, eg.
- href?: string — Makes the whole card a link, opened with `Linking`, as core's `href`.
- selected?: boolean — Brand border and tint, for a picked item in a list or gallery.

### Icon
One of the built-in icons, or one registered with `IconProvider`.
- name: IconName
- size?: TShirtSizes = "m"
- onBackground?, onSolid?: `${ColorScheme}-${ColorWeight}`
- color?: string — A colour, for an icon inside another component's label.
- decorative?: boolean = true — Hidden from screen readers unless `false`, as in core.
- aria-label?: string — The name of a non-decorative icon; its `name` by default, as in core.
- style?: ViewStyle

### Line
A 1px divider in `neutral-alpha-medium`.
- vert?: boolean — Vertical, filling the parent's height.
- background?: Colors = "neutral-alpha-medium"
- style?: ViewStyle

### Button
Action button with variants, sizes, prefix/suffix icons and a loading state; onPress runs it
Also takes React Native's PressableProps.
- variant?: ButtonVariant = "primary" — How the button looks.
- tone?: Tone — Which palette the button draws in: the solid fill of a `primary` button, the label and icons of the others.
- size?: TShirtSizes
- corners?: ButtonCorners — Rounds only these corners; `"none"` squares them all.
- label?: string
- children?: ReactNode
- weight?: "default" | "strong" = "strong"
- rounded?: boolean
- prefixIcon?: IconSlot — An icon name as in core (`"arrowRight"`), or any element.
- suffixIcon?: IconSlot
- loading?: boolean = false
- disabled?: boolean = false — Whether the press behavior is disabled.
- fillWidth?: boolean = false
- horizontal?: "start" | "center" | "end" | "between" = "center"
- onClick?: () => void — Core's name for `onPress`, so the same JSX works on both; `onPress` wins.
- href?: string — Opens this URL with `Linking`, as core's `href` makes the button a link.
- style?: ViewStyle

### Skeleton
A pulsing placeholder while content loads.
- shape?: "line" | "circle" | "block" = "line"
- size?: TShirtSizes = "m"
- width?: number | SpacingToken | Length | `${number}%` — Overrides: a number of points (px, as in core 3.0), a token, `"320px"`, `"20rem"` or `"50%"`.
- height?: number | SpacingToken | Length | `${number}%`
- delay?: number = 0 — Milliseconds before the pulse starts, to stagger several skeletons.
- style?: ViewStyle

## Hooks

- `useIcons`: `(): Record<string, NativeIcon>`
- `useToast`: `(): ToastContextValue`
- `useTheme`: `(): OnceTheme`

## Mixins

### FlexProps
- pointerEvents?: "none" | "all" | "auto" | "box-none" | "box-only" — Core's values, plus React Native's `box-none` and `box-only`.
- direction?: "row" | "column" | "row-reverse" | "column-reverse"
- horizontal?, vertical?: Alignment
- center?, wrap?: boolean
- flex?: number
- background?: Colors | "surface" | "page" | "overlay" | "transparent"
- border?: Colors | "surface" | "transparent"
- borderStyle?: "solid" | "dashed"
- borderWidth?: 1 | 2 | 4 | 8
- shadow?: ShadowSize
- overflow?: "visible" | "hidden" | "scroll" — As on the web, `radius` alone does not clip children: pass `overflow="hidden"`.
- width?, height?, minWidth?, maxWidth?, minHeight?, maxHeight?: Size
- fill?, fillWidth?, fillHeight?, fit?, fitWidth?, fitHeight?: boolean
- aspectRatio?: number | string
- position?: "relative" | "absolute" | "static" — React Native has no `fixed` or `sticky`; `relative` is the default, as in core.
- top?: SpacingToken | number — Offsets: a spacing token, or a number of rem, as in core.
- right?, bottom?, left?: SpacingToken | number
- opacity?: Opacity
- zIndex?: ZIndex | `${ZIndex}`
- hide?: boolean — Renders nothing, as core's `display: none`.
- dark?: boolean — Renders only while the theme is dark (or light); changes no colours.
- light?: boolean
- safeArea?: boolean | SafeAreaEdge[] — Adds the safe-area insets from `ThemeProvider`'s `insets` to the padding on these edges (`true` for all four): the native side of core's `--safe-area-*` tokens.
- xl?: FlexBreakpointProps — Breakpoint overrides, as in core: each applies at and below its max-width (`xs` 480, `s` 768, `m` 1024, `l` 1440; `xl` everywhere), larger first so the smaller wins.
- l?, m?, s?, xs?: FlexBreakpointProps
- radius?: RadiusSize
- style?: StyleProp<ViewStyle>

### SpacingProps
- padding?, paddingLeft?, paddingRight?, paddingTop?, paddingBottom?, paddingX?, paddingY?, margin?, marginLeft?, marginRight?, marginTop?, marginBottom?, marginX?, marginY?, gap?: SpacingValue

### TextProps
- style?: TextStyle | TextStyle[]
- textVariant?: TextVariant — The typography preset, `${family}-${weight}-${size}` (`"body-default-m"`, `"heading-strong-l"`), as in core 3.0 (2.x and the first native preview called it `variant`).
- onBackground?, onSolid?: `${ColorScheme}-${ColorWeight}`
- align?: "left" | "center" | "right" | "justify"
- truncate?: boolean — One line, ending in an ellipsis.
- family?: TextType — Swaps the preset's family and keeps its size and weight, as in core.
- weight?: TextWeight — Swaps the preset's weight and keeps the rest, as in core.

## Types

```ts
type Alignment = "start" | "center" | "end" | "between" | "around" | "even" | "stretch"
type BodyLineHeight = "90" | "100" | "110" | "120"
type BodySize = "90" | "95" | "100" | "105" | "110"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BuiltInIconName = one of the names listed under Icons
type ButtonCorners = "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "link" | "subtle"
type Colors = `${ColorScheme}-${ColorWeight}` | `${ColorScheme}-alpha-${ColorWeight}`
type ColorScheme = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"
type ColorWeight = "weak" | "medium" | "strong"
type CondensedTShirtSizes = "s" | "m" | "l"
type Density = "compact" | "normal" | "spacious"
type DeviceFontSize = "13" | "14" | "15" | "16" | "17" | "18"
type FlexBreakpointProps = Pick< FlexProps, | "direction" | "horizontal" | "vertical" | "center" | "wrap" | "flex" | keyof SpacingProps | "top" | "right" | "bottom" | "left" | "width" | "height" | "maxWidth" | "minWidth" | "minHeight" | "maxHeight" | "fit" | "fitWidth" | "fitHeight" | "fill" | "fillWidth" | "fillHeight" | "aspectRatio" | "background" | "border" | "borderStyle" | "borderWidth" | "radius" | "shadow" | "opacity" | "zIndex" | "pointerEvents" | "dark" | "light" | "position" | "hide" | "overflow" | "style" >
type FlexProps = Flex props
type FontFamilies = { heading?: string; body?: string; label?: string; code?: string }
type IconLibraryOverrides = {} (an app augments it to register its own icon names)
type IconName = BuiltInIconName | Extract<keyof IconLibraryOverrides, string>
type IconSlot = IconName | ReactNode
type Insets = { top: number; right: number; bottom: number; left: number }
type Length = `${number}px` | `${number}rem`
type NeutralColor = "sand" | "gray" | "slate" | "rose" | "mint" | "dusk"
type Opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100
type RadiusSize = TShirtSizes | "full" | "none"
type ResponsiveSpacingToken = TShirtSizes
type SafeAreaEdge = "top" | "right" | "bottom" | "left"
type ScalingSize = "90" | "95" | "100" | "105" | "110"
type Schemes = "blue" | "indigo" | "violet" | "magenta" | "pink" | "red" | "orange" | "yellow" | "moss" | "green" | "emerald" | "aqua" | "cyan"
type ShadowSize = TShirtSizes
type Size = number | SpacingToken | Length | `${number}%`
type SolidStyle = "flat" | "plastic"
type SolidType = "color" | "contrast" | "inverse"
type SpacingProps = the SpacingProps mixin above
type SpacingToken = StaticSpacingToken | ResponsiveSpacingToken
type SpacingValue = SpacingToken | number | Length
type StaticSpacingToken = "0" | "1" | "2" | "4" | "8" | "12" | "16" | "20" | "24" | "32" | "40" | "48" | "56" | "64" | "72" | "80" | "104" | "128" | "160"
type SurfaceStyle = "filled" | "translucent"
type TextSize = TShirtSizes
type TextType = "body" | "heading" | "display" | "label" | "code"
type TextVariant = `${TextType}-${TextWeight}-${TextSize}`
type TextWeight = "default" | "normal" | "medium" | "strong"
type Theme = "dark" | "light" | "system"
type Tone = ColorScheme
type TShirtSizes = CondensedTShirtSizes | "xs" | "xl"
type ZIndex = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
```

## Icons

adjustments, arrowDown, arrowLeft, arrowRight, arrowUp, arrowUpRight, ball, banknotes, barChart, bell, bolt, book, bookmark, calendar, cart, chat, check, checkbox, chevronDoubleLeft, chevronDoubleRight, chevronDown, chevronLeft, chevronRight, chevronUp, chevronsLeftRight, clipboard, close, code, computer, copy, cube, danger, dark, dislike, document, download, edit, enter, eye, eyeDropper, eyeOff, file, filter, flag, folder, food, forward, gift, globe, grid, grip, heart, help, home, image, inbox, info, light, like, linearGauge, link, lock, logout, mail, maximize, menu, minimize, minus, moreHorizontal, newspaper, opacity, organization, pause, paw, payment, people, person, personRemove, play, plus, radialGauge, refresh, return, screen, search, security, send, settings, smiley, sparkle, star, starFill, store, symbol, tag, time, trash, trend, trendDown, trendUp, upload, video, volume, volumeOff, warning, wordmark, world

## Gotchas

- safeArea goes on the views at the screen's edges and needs ThemeProvider insets={useSafeAreaInsets()} at the root: safeArea={["top"]} on a screen without a header, safeArea={["bottom"]} on the tab bar or a bottom action row. Never add the insets by hand.
- There is no Nav or NavItem: a bottom tab bar is a Row safeArea={["bottom"]} under a Line on background="surface", outside the ScrollView, of one Card per tab (flex={1} center, border and background "transparent", accessibilityRole="tab") holding an Icon over a label-default-xs Text, brand-strong when selected and neutral-weak otherwise. With Expo Router it is the tabBar of its Tabs layout.
- There is no Scroller: a screen scrolls in React Native's ScrollView (contentContainerStyle={{ flexGrow: 1 }}), a long list in FlatList; a row of chips that scrolls sideways is a horizontal ScrollView with showsHorizontalScrollIndicator={false}.
- href opens a URL outside the app. Moving between screens is the router: onPress={() => router.push("/rewards")}. There is no SmartLink; a link in a sentence is a Button variant="link" or a pressable Text from React Native.
- borderTop, borderBottom and the other single-side borders do not exist: put a <Line /> above or below the view instead.
- Press handlers are onPress; onClick also works so web code moves over. Never wrap a Button or Card in a Pressable or TouchableOpacity to make it pressable, and never pad a small control to make it tappable: it already takes taps from 44pt around it.
- Icon names come from the Icons list in this file. Never guess a name or cast one with as IconName; an app adds others with IconProvider.
- Colors are semantic tokens ({scheme}-{weight}, -alpha- for a tint), never hex or rgb. On your own React Native view use theme.color("brand-solid-strong") from useTheme().

## Quality bar

- SafeAreaProvider, then ThemeProvider insets={useSafeAreaInsets()} with the web app's style options, then ToastProvider: once, at the root
- safeArea={["top"]} on the screen, safeArea={["bottom"]} on the tab bar; nothing pads for the notch by hand
- Three to five tabs, each an Icon over a one-word label-default-xs Text in a Card with flex={1}, brand-strong for the current tab, on background="surface" under a Line
- The screen title as Heading heading-strong-xl on the left, at most two IconButtons (variant="tertiary", aria-label) on the right

## Gold example (`examples/app-shell.tsx`)

```tsx
/**
 * Gold example: app-shell
 * Target: the providers at the root, a screen header, a screen that scrolls
 * and a bottom tab bar that stays put over the home indicator.
 *
 * In an Expo Router app the providers live in app/_layout.tsx (rules 1),
 * with insets={useSafeAreaInsets()} on ThemeProvider, and the tab bar is the
 * `tabBar` of its Tabs layout; here a state switches the screens so the file
 * stands alone.
 */

import {
  Card,
  Column,
  Heading,
  Icon,
  IconButton,
  type IconName,
  Line,
  Row,
  Text,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/native";
import { type ReactNode, useState } from "react";
import { ScrollView } from "react-native";

type TabId = "home" | "rewards" | "orders" | "account";

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "rewards", label: "Rewards", icon: "gift" },
  { id: "orders", label: "Orders", icon: "document" },
  { id: "account", label: "Account", icon: "person" },
];

function Header({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Row paddingX="20" paddingTop="12" paddingBottom="8" vertical="center" horizontal="between">
      <Heading textVariant="heading-strong-xl">{title}</Heading>
      {action}
    </Row>
  );
}

function TabBar({ value, onValueChange }: { value: TabId; onValueChange: (tab: TabId) => void }) {
  return (
    <Column background="surface">
      <Line />
      <Row paddingX="8" paddingTop="8" gap="4" safeArea={["bottom"]}>
        {TABS.map((tab) => {
          const selected = tab.id === value;
          return (
            <Card
              key={tab.id}
              flex={1}
              center
              gap="2"
              paddingY="4"
              radius="m"
              border="transparent"
              background="transparent"
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onValueChange(tab.id)}
            >
              <Icon name={tab.icon} onBackground={selected ? "brand-strong" : "neutral-weak"} />
              <Text
                textVariant="label-default-xs"
                onBackground={selected ? "brand-strong" : "neutral-weak"}
              >
                {tab.label}
              </Text>
            </Card>
          );
        })}
      </Row>
    </Column>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <Column background="surface" border="neutral-alpha-weak" radius="l" padding="16" gap="4">
      <Text textVariant="label-strong-m">{text}</Text>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        The screen's own content goes here.
      </Text>
    </Column>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>("home");
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <Column fill background="page" safeArea={["top"]}>
      <Header
        title={current.label}
        action={<IconButton icon="bell" variant="tertiary" aria-label="Notifications" />}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Column paddingX="20" paddingY="16" gap="16">
          <Placeholder text={`${current.label} screen`} />
        </Column>
      </ScrollView>
      <TabBar value={tab} onValueChange={setTab} />
    </Column>
  );
}

export default function App() {
  return (
    <ThemeProvider brand="orange" neutral="sand" solid="color">
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </ThemeProvider>
  );
}
```

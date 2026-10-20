# Home screen (@once-ui-system/native)

A greeting header, the hero panel the app is about (a card, a balance, today's plan), stat tiles, a list of next actions, a sheet and a loading skeleton

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

### Avatar
An image, or initials on a neutral circle.
- size?: TShirtSizes | number | Length = "m" — A t-shirt size, a number of points (px, as in core 3.0: `40`), or a `"40px"` / `"2.5rem"` string.
- value?: string — Initials shown when there is no image.
- src?: string
- loading?: boolean
- empty?: boolean — Shows the icon (`person` by default) instead of an image or initials.
- icon?: IconName — The icon of an empty avatar, as in core.
- statusIndicator?: { scheme: "green" | "yellow" | "red" | "gray" } — A status dot; `scheme` is its palette hue, as in core 3.0 (2.x called it `color`).
- style?: ViewStyle

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

### Card
Pressable surface (onPress), with every Flex prop; a static panel is a Column with background, border and radius instead
Mixins: FlexProps, SpacingProps.
Also takes React Native's ViewProps.
- children?: ReactNode
- onPress?: () => void — Makes the card pressable.
- onClick?: () => void — The action to perform when this `View` is clicked on by a non-touch click, eg.
- href?: string — Makes the whole card a link, opened with `Linking`, as core's `href`.
- selected?: boolean — Brand border and tint, for a picked item in a list or gallery.

### Tag
A label, an announcement pill, or a toggle with an optional remove button.
- tone?: Tone — The palette.
- variant?: "default" | "gradient" | "announce" = "default" — How the tag looks: `default`, `gradient` (2.x's `scheme="gradient"`; a flat brand tint here, React Native draws no gradients) or `announce`, the pill 2.x called Badge.
- size?: TShirtSizes
- label?: string
- prefixIcon?: IconSlot — Icon names as in core, or any elements.
- suffixIcon?: IconSlot
- href?: string — Makes the tag a link, opened with `Linking`.
- arrow?: boolean — A chevron after the label, for a tag that leads somewhere.
- effect?: boolean — Core's shine on `announce`.
- selected?: boolean — Makes the tag a toggle, pressed when true.
- onClick?: () => void — Called on a press; with `selected`, the tag is a toggle.
- onPress?: () => void — React Native's name for `onClick`; `onPress` wins.
- onRemove?: () => void — Adds a remove button.
- removeButtonProps?: Partial<IconButtonProps> — Props for the remove button, such as its `aria-label`.
- textVariant?: TextVariant
- children?: ReactNode
- style?: ViewStyle

### Icon
One of the built-in icons, or one registered with `IconProvider`.
- name: IconName
- size?: TShirtSizes = "m"
- onBackground?, onSolid?: `${ColorScheme}-${ColorWeight}`
- color?: string — A colour, for an icon inside another component's label.
- decorative?: boolean = true — Hidden from screen readers unless `false`, as in core.
- aria-label?: string — The name of a non-decorative icon; its `name` by default, as in core.
- style?: ViewStyle

### ProgressBar
A rounded track that fills to `value`, with the value as a label.
- value: number
- min?: number = 0
- max?: number = 100
- showLabel?: boolean = true
- labelPosition?: "top" | "bottom" | "left" | "right" = "bottom"
- barBackground?: Colors = "brand-strong" — The bar's solid colour, as core's `solid` prop: `"brand-strong"` by default.
- style?: ViewStyle

### Dialog
Core's `Dialog`, shown as a bottom sheet by default: the shape phones use for a modal task (`variant="center"` for a card in the middle).
- open: boolean
- onClose: () => void
- title?, description?, children?, footer?: ReactNode
- showClose?: boolean = true — Shows the close button.
- variant?: "center" | "sheet" = "sheet" — The dialog's shape.
- backdrop?: ReactNode — Drawn inside the overlay, behind the panel: an image or a tint.
- minHeight?: number — The panel's minimum height, in points (px, as in core).
- onHeightChange?: (height: number) => void — Called with the panel's height whenever it changes.
- closeOnClickaway?: boolean = true — A tap on the backdrop closes the dialog.
- flush?: boolean = false — Edge to edge, without the sheet's padding, as core's `flush`.
- style?: ViewStyle

### Skeleton
A pulsing placeholder while content loads.
- shape?: "line" | "circle" | "block" = "line"
- size?: TShirtSizes = "m"
- width?: number | SpacingToken | Length | `${number}%` — Overrides: a number of points (px, as in core 3.0), a token, `"320px"`, `"20rem"` or `"50%"`.
- height?: number | SpacingToken | Length | `${number}%`
- delay?: number = 0 — Milliseconds before the pulse starts, to stagger several skeletons.
- style?: ViewStyle

### Line
A 1px divider in `neutral-alpha-medium`.
- vert?: boolean — Vertical, filling the parent's height.
- background?: Colors = "neutral-alpha-medium"
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
type BuiltInIconName = one of the names listed under Icons
type ButtonCorners = "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "link" | "subtle"
type Colors = `${ColorScheme}-${ColorWeight}` | `${ColorScheme}-alpha-${ColorWeight}`
type ColorScheme = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"
type ColorWeight = "weak" | "medium" | "strong"
type CondensedTShirtSizes = "s" | "m" | "l"
type FlexBreakpointProps = Pick< FlexProps, | "direction" | "horizontal" | "vertical" | "center" | "wrap" | "flex" | keyof SpacingProps | "top" | "right" | "bottom" | "left" | "width" | "height" | "maxWidth" | "minWidth" | "minHeight" | "maxHeight" | "fit" | "fitWidth" | "fitHeight" | "fill" | "fillWidth" | "fillHeight" | "aspectRatio" | "background" | "border" | "borderStyle" | "borderWidth" | "radius" | "shadow" | "opacity" | "zIndex" | "pointerEvents" | "dark" | "light" | "position" | "hide" | "overflow" | "style" >
type FlexProps = Flex props
type IconButtonProps = IconButton props
type IconLibraryOverrides = {} (an app augments it to register its own icon names)
type IconName = BuiltInIconName | Extract<keyof IconLibraryOverrides, string>
type IconSlot = IconName | ReactNode
type Length = `${number}px` | `${number}rem`
type Opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100
type RadiusSize = TShirtSizes | "full" | "none"
type ResponsiveSpacingToken = TShirtSizes
type SafeAreaEdge = "top" | "right" | "bottom" | "left"
type ShadowSize = TShirtSizes
type Size = number | SpacingToken | Length | `${number}%`
type SpacingProps = the SpacingProps mixin above
type SpacingToken = StaticSpacingToken | ResponsiveSpacingToken
type SpacingValue = SpacingToken | number | Length
type StaticSpacingToken = "0" | "1" | "2" | "4" | "8" | "12" | "16" | "20" | "24" | "32" | "40" | "48" | "56" | "64" | "72" | "80" | "104" | "128" | "160"
type TextSize = TShirtSizes
type TextType = "body" | "heading" | "display" | "label" | "code"
type TextVariant = `${TextType}-${TextWeight}-${TextSize}`
type TextWeight = "default" | "normal" | "medium" | "strong"
type Tone = ColorScheme
type TShirtSizes = CondensedTShirtSizes | "xs" | "xl"
type ZIndex = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
```

## Icons

adjustments, arrowDown, arrowLeft, arrowRight, arrowUp, arrowUpRight, ball, banknotes, barChart, bell, bolt, book, bookmark, calendar, cart, chat, check, checkbox, chevronDoubleLeft, chevronDoubleRight, chevronDown, chevronLeft, chevronRight, chevronUp, chevronsLeftRight, clipboard, close, code, computer, copy, cube, danger, dark, dislike, document, download, edit, enter, eye, eyeDropper, eyeOff, file, filter, flag, folder, food, forward, gift, globe, grid, grip, heart, help, home, image, inbox, info, light, like, linearGauge, link, lock, logout, mail, maximize, menu, minimize, minus, moreHorizontal, newspaper, opacity, organization, pause, paw, payment, people, person, personRemove, play, plus, radialGauge, refresh, return, screen, search, security, send, settings, smiley, sparkle, star, starFill, store, symbol, tag, time, trash, trend, trendDown, trendUp, upload, video, volume, volumeOff, warning, wordmark, world

## Gotchas

- Card is for pressable surfaces (onPress or onClick). A static panel is a Column background="surface" border="neutral-alpha-weak" radius="l" padding="16".
- Card is a Column by default (direction="column"), with an l radius and a neutral border: a row card needs direction="row", and a pressable list row also radius="none" border="transparent" background="transparent".
- Every string is in Text or Heading, with textVariant (not variant) for the preset and onBackground for the color. A number shown big is Text textVariant="display-strong-s".
- Color is tone, look is variant: Button variant="secondary" tone="danger", Tag tone="success", Feedback tone="warning", addToast({ tone: "success", message }). variant="danger" was 2.x.
- Dialog is a bottom sheet with open and onClose; actions go in footer as Buttons with fillWidth inside a Row gap="12". The back button and a tap on the backdrop call onClose.
- radius does not clip children on React Native: add overflow="hidden" when an image or filled child must follow the corners. On iOS it also hides the view's shadow, so put shadow on a wrapper.
- gap, padding and margin take spacing tokens ("0", "1", "2", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "104", "128", "160", or xs–xl). "6" and "10" are not tokens and are type errors.
- Colors are semantic tokens ({scheme}-{weight}, -alpha- for a tint), never hex or rgb. On your own React Native view use theme.color("brand-solid-strong") from useTheme().
- Icon names come from the Icons list in this file. Never guess a name or cast one with as IconName; an app adds others with IconProvider.

## Quality bar

- One hero panel near the top, background="surface" border radius="l" padding="20", holding the screen's main number or card and its one primary Button
- Stat tiles in a Row gap="12", each a panel with flex={1}: a label-default-s label over a display-strong-xs value
- Next actions as Cards with direction="row": an icon box, a title and a subline in a Column flex={1}, and a chevronRight
- Skeletons in the shape of the screen while it loads, never a lone Spinner
- paddingX="20", gap="24" between sections, "12" inside them

## Gold example (`examples/home.tsx`)

```tsx
/**
 * Gold example: home
 * Target: a greeting header, the hero panel the app is about (here a
 * loyalty card that fills with stamps), a sheet that opens from it, two
 * stat tiles, a list of next actions, and a skeleton while the data loads.
 */

import {
  Avatar,
  Button,
  Card,
  Column,
  Dialog,
  Heading,
  Icon,
  IconButton,
  type IconName,
  ProgressBar,
  Row,
  Skeleton,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/native";
import { useState } from "react";
import { ScrollView } from "react-native";

const STAMPS_PER_REWARD = 10;

const REWARDS: { id: string; title: string; detail: string; icon: IconName }[] = [
  { id: "pastry", title: "Free pastry", detail: "With any coffee, until Sunday", icon: "gift" },
  { id: "friend", title: "Bring a friend", detail: "You both get a stamp", icon: "person" },
];

function StampCard({ stamps, onShowCode }: { stamps: number; onShowCode: () => void }) {
  const left = STAMPS_PER_REWARD - stamps;
  return (
    <Column
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="20"
      gap="16"
      shadow="s"
    >
      <Row horizontal="between" vertical="center">
        <Text textVariant="label-strong-m">Loyalty card</Text>
        <Tag tone="brand" size="s" label={`${stamps}/${STAMPS_PER_REWARD}`} />
      </Row>
      <Row gap="8" wrap>
        {Array.from({ length: STAMPS_PER_REWARD }, (_, slot) => slot).map((slot) => (
          <Column
            key={`stamp-${slot}`}
            width="40"
            height="40"
            radius="full"
            center
            background={slot < stamps ? "brand-strong" : "neutral-alpha-weak"}
          >
            {slot < stamps && <Icon name="check" size="s" onSolid="brand-strong" />}
          </Column>
        ))}
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-medium">
        {left > 0 ? `${left} more and the next coffee is on us.` : "Your next coffee is free."}
      </Text>
      <Button label="Show my code" prefixIcon="screen" fillWidth onPress={onShowCode} />
    </Column>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Column
      flex={1}
      background="surface"
      border="neutral-alpha-weak"
      radius="l"
      padding="16"
      gap="4"
    >
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs">{value}</Text>
    </Column>
  );
}

function HomeSkeleton() {
  return (
    <Column paddingX="20" paddingY="24" gap="24">
      <Row gap="12" vertical="center">
        <Skeleton shape="circle" size="l" />
        <Column flex={1} gap="8">
          <Skeleton shape="line" width="50%" />
          <Skeleton shape="line" width="30%" size="s" />
        </Column>
      </Row>
      <Skeleton shape="block" height={240} />
      <Row gap="12">
        <Skeleton shape="block" height={80} width="50%" />
        <Skeleton shape="block" height={80} width="50%" />
      </Row>
    </Column>
  );
}

export function HomeScreen({ loading = false }: { loading?: boolean }) {
  const { addToast } = useToast();
  const [stamps, setStamps] = useState(7);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <Column fill background="page" safeArea={["top"]}>
      {loading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Column paddingX="20" paddingY="24" gap="24">
            <Row gap="12" vertical="center">
              <Avatar value="AK" size="l" />
              <Column flex={1} gap="2">
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Good morning
                </Text>
                <Heading textVariant="heading-strong-l">Anna</Heading>
              </Column>
              <IconButton icon="bell" variant="tertiary" aria-label="Notifications" />
            </Row>

            <StampCard stamps={stamps} onShowCode={() => setCodeOpen(true)} />

            <Row gap="12">
              <StatTile label="Visits this month" value="12" />
              <StatTile label="Rewards earned" value="3" />
            </Row>

            <Column gap="12">
              <Heading textVariant="heading-strong-m">For you</Heading>
              {REWARDS.map((reward) => (
                <Card
                  key={reward.id}
                  direction="row"
                  padding="16"
                  gap="12"
                  vertical="center"
                  onPress={() => addToast({ tone: "success", message: `${reward.title} saved` })}
                >
                  <Column width="40" height="40" radius="m" center background="brand-alpha-weak">
                    <Icon name={reward.icon} onBackground="brand-strong" />
                  </Column>
                  <Column flex={1} gap="2">
                    <Text textVariant="label-strong-m">{reward.title}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {reward.detail}
                    </Text>
                  </Column>
                  <Icon name="chevronRight" onBackground="neutral-weak" />
                </Card>
              ))}
            </Column>

            <Column gap="8">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Gold status
              </Text>
              <ProgressBar value={64} showLabel={false} />
            </Column>
          </Column>
        </ScrollView>
      )}

      <Dialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        title="Your code"
        description="Show this to the barista to collect a stamp."
        footer={
          <Row gap="12" fillWidth>
            <Button
              variant="secondary"
              label="Close"
              fillWidth
              onPress={() => setCodeOpen(false)}
            />
            <Button
              label="Add stamp"
              fillWidth
              onPress={() => {
                setStamps((count) => Math.min(count + 1, STAMPS_PER_REWARD));
                setCodeOpen(false);
              }}
            />
          </Row>
        }
      >
        <Column center paddingY="24">
          <Column width="160" height="160" radius="l" center background="neutral-alpha-weak">
            <Text textVariant="display-strong-xs">4821</Text>
          </Column>
        </Column>
      </Dialog>
    </Column>
  );
}
```

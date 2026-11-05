# Once UI Native — code generation rules

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

# @once-ui-system/native (preview)

Once UI for React Native: the basic components with the **same props and the
same design tokens** as `@once-ui-system/core`, so a screen written for the web
reads the same on iOS and Android. It is a preview for teams that need a native
app; the main way to ship Once UI on phones stays the web build wrapped by the
Stack mobile target (Capacitor). Published to the `next` tag only.

```sh
npm install @once-ui-system/native@next
```

```tsx
import { Button, Column, Heading, Text, ThemeProvider } from "@once-ui-system/native";

export default function App() {
  return (
    <ThemeProvider brand="orange" neutral="sand" solid="color">
      <Column padding="20" gap="12" background="page" fill>
        <Heading>Morning Coffee</Heading>
        <Text onBackground="neutral-weak">Three more coffees and the next one is on us.</Text>
        <Button label="Add stamp" onPress={() => {}} />
      </Column>
    </ThemeProvider>
  );
}
```

Needs React 19, React Native 0.79 or later (Expo SDK 53+) and `react-native-svg` 15 (included in Expo).

**Props follow core 3.0.** The components take the props of
`@once-ui-system/core` 3.0 (the `feat/3-0-breaking-cleanup` line), not 2.x:
state is `X` / `defaultX` / `onXChange` (`onCheckedChange`, `onValueChange`,
`onOpenChange`), names are `aria-label`, colour is `tone` and look is
`variant`, Text takes `textVariant`, Badge and Chip are `Tag`, and a number
is px. Code written for the first preview (2.x names) needs the renames in
"Coming from the 2.x props" below; core's `scripts/codemod-3.0.mjs` does the
same renames on web code.

Docs: the "React Native" section of the Once UI docs
(`apps/docs/src/content/native/`). This README stays the quick start.

## Components

`ThemeProvider` takes core's style options with core's defaults (`theme`,
`brand`, `accent`, `neutral`, `solid`, `solidStyle`, `border`, `surface`,
`scaling`, `bodySize`, `bodyLineHeight`, `mobileSize`, `tabletSize`,
`desktopSize`), plus `fonts` for families the app has loaded and `insets` for
the safe areas. `theme="system"` follows the device.

| Component | Notes |
| --- | --- |
| `Flex`, `Row`, `Column` | Spacing, alignment (`horizontal`/`vertical` as on the web), `background`, `border`, `radius`, `shadow`, sizes, `position` and offsets, `opacity`, `zIndex`, `hide`, the breakpoint props `xl`…`xs`, and `safeArea`. `Flex` is a row by default, as on the web. |
| `Text`, `Heading` | `textVariant` (`body-default-m`, …), with `weight` and `family` swapping the preset's; `onBackground`, `onSolid`, `truncate`. |
| `Button` | Six variants (`primary`, `secondary`, `tertiary`, `ghost`, `link`, `subtle`) in any `tone`, five sizes, `corners`, `loading`, `disabled`, `fillWidth`; `onPress` or core's `onClick`, `href` opens a URL; pressed replaces hover. |
| `Card` | Pressable when given `onPress` (or core's `onClick`), `href`, `selected`. |
| `Input`, `Textarea` | Floating label, `error` + `errorMessage`, `description`, `prefix`/`suffix`, `characterCount`, `onValueChange`; `type="password"` with a show/hide button (`reveal={false}` drops it), `type="email"` and friends pick the keyboard; Textarea `lines` (a number or `"auto"`). |
| `Switch`, `Checkbox` | `checked` / `defaultChecked` / `onCheckedChange`, label and description, `size`, `error` / `errorMessage`. |
| `Icon`, `IconButton`, `IconProvider` | Core's built-in icons, drawn with `react-native-svg`. `IconButton` takes `tone`, `variant` and `aria-label` (or a plain-text `tooltip`). `prefixIcon`/`suffixIcon` on `Button` and `Tag` take a name as in core, or any element. `IconProvider` adds icons: core's SVG data or a component taking `size` and `color` (for example from `@expo/vector-icons`). |
| `Dialog` | A bottom sheet with core's props (`open`, `onClose`, `title`, `description`, `footer`, `showClose`, `backdrop`); `variant="center"` for a card in the middle. The back button and a tap on the backdrop close it. |
| `ToastProvider`, `useToast`, `Toast` | `addToast({ tone, message })` as in core; toasts stack at the bottom and hide after 6 s. |
| `Select`, `Option` | An `Input`-styled field that opens its options in a bottom sheet; `value` / `defaultValue` / `onValueChange`, `open` / `defaultOpen` / `onOpenChange`, `multiple`, `searchable`. |
| `RadioGroup`, `RadioButton`, `SegmentedControl` | One choice out of several; `value` / `defaultValue` / `onValueChange` as in core (RadioButton `onCheckedChange`), SegmentedControl `disabled`. |
| `Tag` | A label in its `tone`; `variant="announce"` is the pill 2.x called Badge (`href`, `arrow`); `selected`, `onClick` and `onRemove` make the toggle 2.x called Chip. |
| `Avatar`, `Feedback`, `ProgressBar`, `Line`, `Spinner`, `Skeleton` | As in core (`Feedback tone`, Avatar `statusIndicator={{ scheme }}`, `empty` and `icon`). |
| `Media` | An image at `aspectRatio` (`"16 / 9"`, or `"original"` for the image's own) with `radius`, `border` and the other `Flex` props, a `Skeleton` until it loads, `objectFit`, `caption`, `onPress`. |
| `List`, `ListItem` | Bullets, or numbers with `as="ol"` and `start`, drawn in core's indent in `neutral-on-background-weak`. |
| `Tabs`, `TabList`, `Tab`, `TabPanel` | As in core: `value` / `defaultValue` / `onValueChange`, `orientation`, `keepMounted`; without a value the first enabled tab is selected. |
| `ToggleButton` | Core's `ghost`, `outline` and `subtle` variants, five sizes, `selected`; `Tab` is built on it. |
| `Accordion` | `title`, `open` / `defaultOpen` / `onOpenChange` (or its own state), `icon`, `iconRotation`, `size`; eases open and shut with `LayoutAnimation`. A ref gives `toggle()`, `open()`, `close()`. |
| `AvatarGroup`, `StatusIndicator` | As in core (StatusIndicator `scheme`). |

`useTheme()` gives the resolved theme to your own components:
`theme.color("brand-solid-strong")`, `theme.space("16")`, `theme.radius("l")`,
`theme.text("heading-strong-m")`, `theme.shadow("m")`, and `theme.width`,
`theme.breakpoints` and `theme.insets`.

## Responsive props

`Flex`, `Row`, `Column` and `Card` take core's breakpoint objects: `xl`, `l`,
`m`, `s` and `xs`. Each applies at and below its max-width (`xs` 480, `s` 768,
`m` 1024, `l` 1440; `xl` at every width), larger first, so the smaller one
wins, as in the browser. The width is the window's, read by `ThemeProvider`.

```tsx
<Column gap="16" s={{ direction: "row", gap: "4" }} m={{ hide: true }}>
```

Every key of core's `FlexBreakpointProps` that has a native style works:
`direction`, `horizontal`, `vertical`, `center`, `wrap`, `flex`, the spacing
props, `top`/`right`/`bottom`/`left`, the size and `fill`/`fit` props,
`aspectRatio`, `background`, `border`, `borderStyle`, `borderWidth`, `radius`,
`shadow`, `opacity`, `zIndex`, `pointerEvents`, `position`, `hide`, `dark`,
`light`, `overflow` and `style`. Not supported, here or on the base props:
`solid`, `borderTop`…`borderY`, `onBackground`, `onSolid`, `align`,
`textVariant`/`textSize`/`textWeight`/`textType`, `transition`, `scrollbar`,
`overflowX` and `overflowY`. `position` takes `relative`, `absolute` and
`static`; React Native has no `fixed` or `sticky`.

## Safe areas

React Native has no cross-platform API for the notch and home indicator, so
pass the insets to `ThemeProvider`, for example from
[react-native-safe-area-context](https://github.com/AppAndFlow/react-native-safe-area-context)
(included in Expo):

```tsx
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

function Themed({ children }: { children: React.ReactNode }) {
  return <ThemeProvider insets={useSafeAreaInsets()}>{children}</ThemeProvider>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Themed>
        <Column fill background="page" padding="20" safeArea>
          …
        </Column>
      </Themed>
    </SafeAreaProvider>
  );
}
```

`Dialog` then clears the home indicator and toasts stack above it. `safeArea`
on `Flex` (`true`, or edges such as `["top", "bottom"]`) adds the insets to
that view's padding: the native side of core's `--safe-area-*` tokens. Without
`insets` they are all 0. `theme.insets` gives them to your own components.

## Differences from core

- **Units:** as in core 3.0, a number on a spacing or size prop is px, which
  here is density-independent points (`maxWidth={320}`). Tokens are unchanged
  (`padding="16"`), and `"24px"` and `"1.5rem"` strings work too, a rem being
  the device size Once UI uses (15pt on phones, 16pt on tablets). Other CSS
  lengths (`vh`, `calc()`) are web-only.
- **Touch:** small controls (`Button`, `Switch`, `Checkbox`) take taps from
  core's `--touch-target` (2.75rem) around them without being drawn larger.
- **Clipping:** `radius` does not clip children, as on the web; pass
  `overflow="hidden"` when it should (on iOS that also hides the view's shadow).
- **Dialog** opens as a bottom sheet unless `variant="center"` (core's default
  is the centred card). **Tag** `variant="gradient"` is a flat brand tint and
  `effect` draws no shine: React Native has no CSS gradients.
- **Handlers:** `onPress` is React Native's name; `Button`, `IconButton`,
  `Card`, `Tag` and `Option` also take core's `onClick`, so the same JSX works
  on both.
- **Media** draws images only: core's enlarge-on-click overlay, video files
  and YouTube embeds are left out, as are the web-only `sizes`, `priority` and
  `unoptimized`. Without an `aspectRatio` the box is `height` points tall (or the
  `80` step) until React Native reports the image's size.
- **Tabs** have no arrow-key focus, so `activation` is accepted and ignored.
- **Core 3.0 names:** `Accordion` also takes `defaultOpen` and `onOpenChange`,
  `Tabs` takes `onValueChange`, and `StatusIndicator` takes `scheme`, so code
  written for 3.0 works here too.
- **List** draws its own bullets and numbers, since React Native has no list markers.
- **Safe areas:** read from `ThemeProvider`'s `insets` rather than CSS `env()`;
  see [Safe areas](#safe-areas).

## Coming from the 2.x props

| 2.x / first preview | Now (core 3.0) |
| --- | --- |
| Checkbox, RadioButton, Switch `onToggle` | `onCheckedChange` |
| RadioGroup, SegmentedControl `onChange` | `onValueChange` |
| Select `onSelect` | `onValueChange` (plus `defaultValue`, `open` / `defaultOpen` / `onOpenChange`) |
| `ariaLabel` on IconButton, Spinner, Switch, Checkbox, RadioButton, Icon | `aria-label` |
| Button, IconButton `variant="danger"` / `"success"` / `"warning"` | `tone="danger"` (any variant takes any tone) |
| Button, IconButton `variant="quaternary"` | `variant="ghost"` |
| IconButton `color` | an `<Icon onBackground="…">` as its children |
| Tag `scheme` | `tone` |
| Feedback, Toast, `addToast({ variant })` | `tone`; the `ToastVariant` type is gone (use `Tone`) |
| Text, Heading `variant` | `textVariant`; Text `size` is gone (pick the preset) |
| `<Badge title icon arrow onPress>` | `<Tag variant="announce" label prefixIcon arrow onPress>` |
| `<Chip label onRemove>` (selected by default) | `<Tag selected label onRemove>`; `selected` defaults to false |
| Dialog `hideClose` | `showClose={false}` |
| Avatar `statusIndicator={{ color }}` | `statusIndicator={{ scheme }}` |
| A number on spacing, sizes or Avatar `size`: rem | px; write `"Nrem"` to keep the 2.x size |

## Tokens

The components read `@once-ui-system/foundations`' token export (the SCSS
tokens as JSON, see `packages/foundations/tokens/README.md`), bundled into the
package and also shipped as `@once-ui-system/native/tokens.json`. Core ships
the same file as `@once-ui-system/core/tokens.json`. A change to a token in
`scss/tokens/` reaches both platforms.

## Developing

```sh
pnpm --filter @once-ui-system/native test       # components render through react-native-web
pnpm --filter @once-ui-system/native typecheck  # against React Native's own types
pnpm --filter @once-ui-system/native demo       # demo/index.html: a sample screen in the browser
```

Releases: push a `native-v<version>` tag with a prerelease version (for example
`native-v0.1.0-preview.1`); the release workflow refuses a stable version.

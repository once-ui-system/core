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
`desktopSize`), plus `fonts` for families the app has loaded. `theme="system"`
follows the device.

| Component | Notes |
| --- | --- |
| `Flex`, `Row`, `Column` | Spacing, alignment (`horizontal`/`vertical` as on the web), `background`, `border`, `radius`, `shadow`, sizes. `Flex` is a row by default, as on the web. |
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

`useTheme()` gives the resolved theme to your own components:
`theme.color("brand-solid-strong")`, `theme.space("16")`, `theme.radius("l")`,
`theme.text("heading-strong-m")`, `theme.shadow("m")`.

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
- **No responsive props** (`s`, `m`, …) yet; the phone breakpoint's token values
  apply on phones automatically.
- **Dialog** opens as a bottom sheet unless `variant="center"` (core's default
  is the centred card). **Tag** `variant="gradient"` is a flat brand tint and
  `effect` draws no shine: React Native has no CSS gradients.
- **Handlers:** `onPress` is React Native's name; `Button`, `IconButton`,
  `Card`, `Tag` and `Option` also take core's `onClick`, so the same JSX works
  on both.

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

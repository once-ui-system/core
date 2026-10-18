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
| `Text`, `Heading` | `variant` (`body-default-m`, …), `onBackground`, `onSolid`, `truncate`. |
| `Button` | All ten variants, five sizes, `loading`, `disabled`, `fillWidth`; pressed replaces hover. |
| `Card` | Pressable when given `onPress` (or core's `onClick`), `selected`. |
| `Input`, `Textarea` | Floating label, `error` + `errorMessage`, `description`, `prefix`/`suffix`, `characterCount`. |
| `Switch`, `Checkbox` | Controlled (`checked`) or not (`defaultChecked`), `onToggle`, label and description. |
| `Icon`, `IconButton`, `IconProvider` | Core's built-in icons, drawn with `react-native-svg`. `prefixIcon`/`suffixIcon` on `Button` and `Tag` take a name as in core, or any element. `IconProvider` adds icons: core's SVG data or a component taking `size` and `color` (for example from `@expo/vector-icons`). |
| `Dialog` | A bottom sheet with core's props (`open`, `onClose`, `title`, `description`, `footer`); the back button and a tap on the backdrop close it. |
| `ToastProvider`, `useToast`, `Toast` | `addToast({ variant, message })` as in core; toasts stack at the bottom and hide after 6 s. |
| `Select`, `Option` | An `Input`-styled field that opens its options in a bottom sheet; `multiple`, `searchable`. |
| `RadioGroup`, `RadioButton`, `SegmentedControl` | One choice out of several; `value`/`defaultValue` and `onChange` as in core. |
| `Chip`, `Badge`, `ProgressBar` | As in core; a `Chip` with `onRemove` gets a remove button. |
| `Tag`, `Avatar`, `Feedback`, `Line`, `Spinner`, `Skeleton` | As in core. |
| `Media` | An image at `aspectRatio` (`"16 / 9"`, or `"original"` for the image's own) with `radius`, `border` and the other `Flex` props, a `Skeleton` until it loads, `objectFit`, `caption`, `onPress`. |
| `List`, `ListItem` | Bullets, or numbers with `as="ol"` and `start`, drawn in core's indent in `neutral-on-background-weak`. |
| `Tabs`, `TabList`, `Tab`, `TabPanel` | As in core: `value`/`defaultValue` and `onChange`, `orientation`, `keepMounted`; without a value the first enabled tab is selected. |
| `ToggleButton` | Core's `ghost`, `outline` and `subtle` variants, five sizes, `selected`; `Tab` is built on it. |
| `Accordion` | `title`, `open` with `onToggle` (or its own state), `icon`, `iconRotation`, `size`; eases open and shut with `LayoutAnimation`. A ref gives `toggle()`, `open()`, `close()`. |
| `AvatarGroup`, `StatusIndicator` | As in core. |

`useTheme()` gives the resolved theme to your own components:
`theme.color("brand-solid-strong")`, `theme.space("16")`, `theme.radius("l")`,
`theme.text("heading-strong-m")`, `theme.shadow("m")`.

## Differences from core

- **Units:** numbers on spacing and size props are rem, as on the web, and rem
  follows the device size Once UI uses (15pt on phones, 16pt on tablets).
- **Touch:** small controls (`Button`, `Switch`, `Checkbox`) take taps from
  core's `--touch-target` (2.75rem) around them without being drawn larger.
- **Clipping:** `radius` does not clip children, as on the web; pass
  `overflow="hidden"` when it should (on iOS that also hides the view's shadow).
- **Media** draws images only: core's enlarge-on-click overlay, video files
  and YouTube embeds are left out, as are the web-only `sizes`, `priority` and
  `unoptimized`. Without an `aspectRatio` the box is `height` rem tall (or the
  `80` step) until React Native reports the image's size.
- **Tabs** have no arrow-key focus, so `activation` is accepted and ignored.
- **List** draws its own bullets and numbers, since React Native has no list markers.
- **No responsive props** (`s`, `m`, …) yet; the phone breakpoint's token values
  apply on phones automatically.

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

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

Needs React 19 and React Native 0.79 or later (Expo SDK 53+).

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
| `Tag`, `Avatar`, `Feedback`, `Line`, `Spinner`, `Skeleton` | As in core. |

`useTheme()` gives the resolved theme to your own components:
`theme.color("brand-solid-strong")`, `theme.space("16")`, `theme.radius("l")`,
`theme.text("heading-strong-m")`, `theme.shadow("m")`.

## Differences from core

- **Icons:** core's `prefixIcon`/`suffixIcon`/`icon` take an icon name; here
  they take an element, since the preview has no icon set yet.
- **Units:** numbers on spacing and size props are rem, as on the web, and rem
  follows the device size Once UI uses (15pt on phones, 16pt on tablets).
- **Touch:** small controls (`Button`, `Switch`, `Checkbox`) take taps from
  core's `--touch-target` (2.75rem) around them without being drawn larger.
- **Clipping:** `radius` does not clip children, as on the web; pass
  `overflow="hidden"` when it should (on iOS that also hides the view's shadow).
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

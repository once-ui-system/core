# @once-ui-system/native — agent harness

This package ships an agent harness under `ai/`, next to this file, for **writing React Native screens with Once UI**. The components have the same names, props and design tokens as `@once-ui-system/core` 3.0, so a phone app and its web app can be written from one description. Paths below are relative to this file (in an app: `node_modules/@once-ui-system/native/`).

## Writing a screen

Every file you read is sent again on every later turn, so read what you need in one step, then write.

1. Pick the bundle below closest to the screen you are building and read it, together with any project files you need, in a single step. A bundle is complete: the rules, every component's props, types, gotchas, the quality bar and a gold example. Then write the code.
2. Need a component the bundle does not list? Read its `ai/components/<Name>.json`, all of them in one step. `ai/catalog.json` names every component with its purpose and lists the icon names.
3. Nothing fits? Read `ai/bundles/screen.md` (the rules and the common components) with the slices your screen adds, in one step.

<!-- tasks:start -->
| Bundle | For |
|---|---|
| `ai/bundles/app-shell.md` | App shell: The providers at the root, safe areas, a screen header and a bottom tab bar, for a new app or its navigation |
| `ai/bundles/home.md` | Home screen: A greeting header, the hero panel the app is about (a card, a balance, today's plan), stat tiles, a list of next actions, a sheet and a loading skeleton |
| `ai/bundles/list.md` | List screen: A title, a search field and a filter over a FlatList of records with status tags, pull to refresh, a details sheet and an empty state |
| `ai/bundles/settings.md` | Settings screen: A profile header, sections of settings rows with one control each, a picker, an edit sheet with fields and a confirmed sign-out |
| `ai/bundles/screen.md` | Any other screen: The rules and the components nearly every screen uses, with their types. Read it with the `components/<Name>.json` slices your screen adds, in one step |
<!-- tasks:end -->

Check the code with the app's TypeScript compiler (`npx tsc --noEmit`): every prop and token in the bundles is typed, so a wrong one is an error there.

## The same app on the web

When the request is for a web app and a phone app, build the web one with `@once-ui-system/core` (its harness is `node_modules/@once-ui-system/core/AGENTS.md`) and this one side by side:

- Keep content and data (copy, lists, prices, types) in one module both apps import; only the screens differ.
- Give `ThemeProvider` the style options of the web app's `once-ui.config` (`brand`, `neutral`, `solid`, `border`, …), so a brand change in one place reaches both.
- Write the same component tree where the platforms agree. Where they differ, follow these rules: a web `Table` is a `FlatList` of rows, a `Setting` a `Switch` with `reverse`, a `Dialog` opens as a bottom sheet, the sidebar `Nav` a bottom tab bar.

## Setup

Needs React 19, React Native 0.79 or later (Expo SDK 53+), `react-native-svg` 15 and, for safe areas, `react-native-safe-area-context` (both included in Expo). `ai/manifest.json` lists the harness files.

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

## A new app

A new app with a bottom tab bar starts from `ai/starters/app/`: a working Expo Router setup with the providers in `src/app/_layout.tsx`, the tab bar mounted once in `src/app/(app)/_layout.tsx`, and the screens of core's web starter (`Home`, and `Settings` with `Profile`) at the same routes. Create the Expo app, then copy the starter over its `src/` (the `node -p` finds the package wherever npm put it, also at a workspace root):

```bash
npx create-expo-app@latest phone --template default
cd phone
npx expo install @once-ui-system/native react-native-svg
rm -rf src && mkdir src
cp -r "$(node -p "require('path').dirname(require.resolve('@once-ui-system/native/package.json'))")/ai/starters/app/src/." src/
```

Then edit, rather than rewrite:

- `src/resources/once-ui.config.ts`: the look (`brand`, `neutral`, `solid`, …), with the names and values of the web app's config.
- `src/resources/app.ts`: the name, the user and `nav`. Each top-level entry is a tab; a group is a tab whose screen lists its links.
- A new screen is a file under `src/app/(app)/` that returns `<Screen title="…">` with its content. Expo Router shows only the screens a layout declares: a new tab goes in `nav`, which declares it, and a page inside a group needs a `<Stack.Screen name="…" />` in that group's `_layout.tsx`.

## The same app on the web

When the request is for a web app and a phone app, make one folder with both, and a `shared` package for what they have in common. The two starters have the same shape (`resources/once-ui.config.ts`, `resources/app.ts`) and the same routes, so the web pages and the phone screens line up one to one.

```bash
mkdir acme && cd acme && git init
npx create-next-app@latest web --ts --app --src-dir --no-tailwind --use-npm --skip-install --yes
npx create-expo-app@latest phone --template default --no-install
```

- `package.json` at the root: `{ "private": true, "workspaces": ["web", "phone", "shared"] }`. One `npm install` there installs both apps.
- `shared/package.json`: `{ "name": "shared", "private": true, "main": "index.ts" }`, and `shared/index.ts` exports `style` (the web config's style options, `as const`), `app`, `user` and `nav` (`as const`; icon names are the same on both platforms). Add `"shared": "*"` to both apps' dependencies. Give `style` `defaultTheme: "system"`, so the web follows the device's appearance as the phone does; with `"dark"`, a first web visit is dark whatever the device says.
- The web app's root layout, a server component, imports `shared/index.ts`. Keep it to plain data and pure functions; hooks and state (a cart, a store) go in another file of `shared` that starts with `"use client"`.
- Add a root `.gitignore` with `node_modules`, `.next`, `.expo`, `dist*`.
- The web app: `@once-ui-system/core` and core's starter (`node_modules/@once-ui-system/core/AGENTS.md`), with `transpilePackages: ["shared"]` in `next.config.ts`.
- The phone app: after the root `npm install`, run `npx expo install @once-ui-system/native react-native-svg` in `phone` (Expo picks the native module versions), then copy the starter as above; the `node -p` path finds the package at the root.
- A group of links (Settings) is a tab with its own list screen on the phone and a sidebar group on the web, which has no page at `/settings`. Its links have the same routes on both.
- In each app, `resources/once-ui.config.ts` takes `style` from `shared`, and `resources/app.ts` re-exports `app` and `user` and builds its typed `nav` from shared's. `ThemeProvider` here takes the web config as it is (`defaultTheme` and `transition` included), so a brand change in `shared` reaches both.

Then, for each feature:

- Keep content and data (copy, lists, prices, types) in `shared`; only the screens differ.
- Write the same component tree where the platforms agree. Where they differ, follow these rules: a web `Table` is a `FlatList` of rows, a `Setting` a `Switch` with `reverse`, a `Dialog` opens as a bottom sheet, the sidebar `Nav` the bottom tab bar.
- Check both: `npx tsc --noEmit` in `web` and in `phone`.

## Setup

Needs React 19, React Native 0.79 or later (Expo SDK 53+), `react-native-svg` 15 and, for safe areas, `react-native-safe-area-context` (both included in Expo). `ai/manifest.json` lists the harness files.

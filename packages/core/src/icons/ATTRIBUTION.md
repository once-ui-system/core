# Built-in icons

Once UI's built-in icons are its own, drawn as code in
[once-ui-system/icons](https://github.com/once-ui-system/icons) and released
under the MIT licence, the same as core.

`src/icons/data.ts` is generated from that repo's build by
`scripts/generate-icons.mjs` (`pnpm generate-icons --from <icons repo>`).
It carries the `rounded` line set; `data-border="conservative"` squares the
caps and joins through the `--icon-linecap` and `--icon-linejoin` tokens.

Until 2.x these icons came from Heroicons, Ionicons, Lucide and Phosphor
through react-icons. The rich text toolbar (`src/modules/richtext/icons.ts`)
still draws Heroicons (MIT, © Tailwind Labs).

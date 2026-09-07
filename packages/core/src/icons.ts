import { iconData } from "./icons/data";
import { createIcon, type IconComponent } from "./icons/renderIcon";

export type { IconComponent, IconNode } from "./icons/renderIcon";

/**
 * The icons Once UI ships with, built from inlined SVG data.
 *
 * These used to come from `react-icons`, which every consumer then installed —
 * 85M to render 54 icons worth about 4 kB gzipped in the bundle. The data is
 * inlined now and react-icons is a build-time devDependency, so an app that
 * only uses the built-ins installs none of it. An app that wants more can
 * still register react-icons components, or lucide, or its own SVGs: the
 * registry is typed structurally, not against one library.
 */
export const iconLibrary = Object.fromEntries(
  Object.entries(iconData).map(([name, data]) => [name, createIcon(data)]),
) as { [K in keyof typeof iconData]: IconComponent };

/** The names Once UI ships. */
export type BuiltInIconName = keyof typeof iconData;

/**
 * Names an app has registered of its own, declared by augmenting this:
 *
 * ```ts
 * declare module "@once-ui-system/core" {
 *   interface IconLibraryOverrides {
 *     rocket: true;
 *   }
 * }
 * ```
 *
 * Without this the registry was typed `Record<string, IconType>`, so `IconName`
 * collapsed to `string`: every name compiled, including a typo, and the only
 * signal was a console warning and a missing icon at runtime.
 */
// biome-ignore lint/suspicious/noEmptyInterface: the point is for apps to augment it
export interface IconLibraryOverrides {}

export type IconName = BuiltInIconName | Extract<keyof IconLibraryOverrides, string>;

export type IconLibrary = Record<IconName, IconComponent>;

import type { IconName as OnceUIIconName } from "@once-ui-system/core";
import { type IconComponent, iconLibrary as once } from "@once-ui-system/core";
import type { IconType } from "react-icons";
import { FaMailchimp } from "react-icons/fa6";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { LiaCubesSolid } from "react-icons/lia";
import { RiOpenaiFill } from "react-icons/ri";
import { SiClaude } from "react-icons/si";
import { blockIcons } from "@/blocks/modules/blockIcons";

/**
 * The docs' extra icon names. Once UI's own glyphs render for every name it
 * ships, so never register one of those here: this object is passed to
 * IconProvider and would replace our icon with someone else's. Names the docs
 * used before 3.0 point at the matching Once UI glyph; only brand marks and the
 * two shapes Once UI does not draw yet come from react-icons.
 */
export const iconLibrary = {
  ...blockIcons,
  // Brand marks.
  openai: RiOpenaiFill,
  claude: SiClaude,
  mailchimp: FaMailchimp,
  // Not drawn by Once UI yet.
  package: HiOutlineArchiveBox,
  modules: LiaCubesSolid,
  // Older docs names for Once UI's own glyphs.
  apps: once.grid,
  article: once.list,
  basics: once.cube,
  changelog: once.time,
  components: once.cube,
  config: once.adjustments,
  divergingBars: once.arrowsRightLeft,
  heatmap: once.table,
  lineBarChart: once.presentation,
  lineChart: once.trendUp,
  notification: once.bell,
  openLink: once.link,
  project: once.layers,
  queue: once.list,
  roadmap: once.map,
  scholar: once.academicCap,
  sparkline: once.trend,
  style: once.brush,
  switch: once.toggle,
  treemap: once.grid,
} satisfies Record<string, IconType | IconComponent>;

export type IconLibrary = typeof iconLibrary;
/** Every name an `Icon` takes in the docs: Once UI's own and the ones above. */
export type IconName = OnceUIIconName;
// Teach Once UI the names registered above, so `<Icon name="rocket" />` and
// friends type-check instead of silently rendering nothing. Derived from the
// object itself, so it cannot drift. The object is checked with `satisfies`
// rather than annotated: `Record<string, IconType>` as its type widened the
// keys to `string`, so every name, typos included, compiled.
declare module "@once-ui-system/core" {
  interface IconLibraryOverrides extends Record<keyof typeof iconLibrary, true> {}
}

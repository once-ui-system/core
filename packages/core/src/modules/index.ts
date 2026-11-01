// `code`, `media` and `data` are NOT re-exported here on purpose.
//
// Their implementations import prismjs, compressorjs and recharts. A bundler
// resolves those specifiers when it walks this barrel, so re-exporting them
// put all three into every consumer's module graph — an app that never
// rendered a chart still failed to build without recharts installed. The
// dynamic import and its catch() never ran; the failure is at resolution, not
// at runtime. Reaching them through their own subpath keeps the specifier out
// of the graph of everyone who does not ask for it.

export * from "./ai/index.js";
export * from "./chat/index.js";
// Sparkline is plain SVG with no recharts behind it, so the root can carry it
// too: a server component imports it with the rest of the page.
export type { SparklineCurve, SparklineProps } from "./data/Sparkline.js";
export { Sparkline } from "./data/Sparkline.js";
export { HeadingLink } from "./navigation/HeadingLink.js";
// The types these components take, so consumers can annotate their own nav
// data instead of letting the literals widen to `string`.
export type {
  KbarFilter,
  KbarItem,
  KbarLabels,
  MegaMenuProps,
  MenuGroup,
  MenuLink,
  MenuSection,
} from "./navigation/index.js";
export { HeadingNav, Kbar, MegaMenu } from "./navigation/index.js";
export * from "./seo/index.js";
export * from "./social/index.js";

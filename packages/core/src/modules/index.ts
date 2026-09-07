// `code`, `media` and `data` are NOT re-exported here on purpose.
//
// Their implementations import prismjs, compressorjs and recharts. A bundler
// resolves those specifiers when it walks this barrel, so re-exporting them
// put all three into every consumer's module graph — an app that never
// rendered a chart still failed to build without recharts installed. The
// dynamic import and its catch() never ran; the failure is at resolution, not
// at runtime. Reaching them through their own subpath keeps the specifier out
// of the graph of everyone who does not ask for it.
export * from "./seo";
export { Kbar, MobileMegaMenu, MegaMenu, HeadingNav } from "./navigation";
// The types these components take, so consumers can annotate their own nav
// data instead of letting the literals widen to `string`.
export type {
  KbarItem,
  MegaMenuProps,
  MenuGroup,
  MenuLink,
  MenuSection,
  MobileMegaMenuProps,
} from "./navigation";
export { HeadingLink } from "./navigation/HeadingLink";

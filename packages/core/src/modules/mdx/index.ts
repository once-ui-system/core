// `@once-ui-system/core/mdx`: one component map for MDX content.
//
// Its own subpath, never re-exported from the root or `modules` barrel: the
// map renders fenced code through CodeBlock, so it sits behind `/code` and its
// optional `prismjs` peer. Nothing here imports `next/*`; links and images go
// through the adapters `@once-ui-system/core/next` installs.

export type {
  MdxBlockQuoteProps,
  MdxCodeBlockProps,
  MdxElementProps,
  MdxHeadingProps,
  MdxHeadingTag,
  MdxHrProps,
  MdxImageProps,
  MdxInlineCodeProps,
  MdxListItemProps,
  MdxListProps,
  MdxParagraphProps,
  MdxSpacingProps,
  MdxTableProps,
  MdxTag,
} from "./MdxElements.js";
export {
  MdxBlockQuote,
  MdxCodeBlock,
  MdxHeading,
  MdxHr,
  MdxImage,
  MdxInlineCode,
  MdxLink,
  MdxList,
  MdxListItem,
  MdxParagraph,
  MdxTable,
} from "./MdxElements.js";
export type { MdxHeadingAnchorProps } from "./MdxHeadingAnchor.js";
export { MdxHeadingAnchor } from "./MdxHeadingAnchor.js";
export type { MdxComponents } from "./mdxComponents.js";
export { createMdxComponents, mdxComponents } from "./mdxComponents.js";
export { slugify, textOf } from "./text.js";

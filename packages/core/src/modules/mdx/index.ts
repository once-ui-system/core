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
} from "./MdxElements";
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
} from "./MdxElements";
export type { MdxHeadingAnchorProps } from "./MdxHeadingAnchor";
export { MdxHeadingAnchor } from "./MdxHeadingAnchor";
export type { MdxComponents } from "./mdxComponents";
export { createMdxComponents, mdxComponents } from "./mdxComponents";
export { slugify, textOf } from "./text";

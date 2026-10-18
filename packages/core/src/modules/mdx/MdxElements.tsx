import {
  Children,
  type CSSProperties,
  isValidElement,
  type JSX,
  type ReactElement,
  type ReactNode,
} from "react";
import { Accordion } from "../../components/Accordion";
import { AccordionGroup } from "../../components/AccordionGroup";
import { BlockQuote } from "../../components/BlockQuote";
import { Card } from "../../components/Card";
import { Column } from "../../components/Column";
import { Feedback } from "../../components/Feedback";
import { Grid } from "../../components/Grid";
import { Heading } from "../../components/Heading";
import { InlineCode } from "../../components/InlineCode";
import { Line } from "../../components/Line";
import { List } from "../../components/List";
import { ListItem } from "../../components/ListItem";
import { Media } from "../../components/Media";
import { OgCard } from "../../components/OgCard";
import { Row } from "../../components/Row";
import { SmartLink } from "../../components/SmartLink";
import { Table } from "../../components/Table";
import { Text } from "../../components/Text";
import type { SpacingProps } from "../../interfaces";
import { CodeBlock } from "../code/CodeBlock";
import styles from "./MdxElements.module.scss";
import { MdxHeadingAnchor } from "./MdxHeadingAnchor";
import { slugify, textOf } from "./text";

/** An HTML tag MDX can render, and so a key the component map can replace. */
export type MdxTag = keyof JSX.IntrinsicElements;

/**
 * The props MDX passes to the component that replaces `Tag`: the element's
 * own attributes, which is all Markdown can produce.
 */
export type MdxElementProps<Tag extends MdxTag> = React.ComponentPropsWithoutRef<Tag>;

/**
 * Margins an element component accepts on top of its MDX props, for overrides
 * like `h2: (props) => <MdxHeading as="h2" marginTop="64" {...props} />`.
 * Passing any of them replaces the element's default margins as a whole, so
 * `marginY` is never fighting a default `marginTop`.
 */
export type MdxSpacingProps = Pick<
  SpacingProps,
  "margin" | "marginTop" | "marginBottom" | "marginLeft" | "marginRight" | "marginX" | "marginY"
>;

function splitSpacing<P extends MdxSpacingProps>(props: P, defaults: MdxSpacingProps) {
  const { margin, marginTop, marginBottom, marginLeft, marginRight, marginX, marginY, ...rest } =
    props;
  const own = { margin, marginTop, marginBottom, marginLeft, marginRight, marginX, marginY };
  const spacing = Object.values(own).some((value) => value !== undefined) ? own : defaults;
  return { spacing, rest };
}

const BODY_LINE_HEIGHT: CSSProperties = { lineHeight: "175%" };

// ─── Headings ───────────────────────────────────────────────────────────────

export type MdxHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type MdxHeadingProps = MdxElementProps<"h1"> &
  MdxSpacingProps & {
    /** The heading level to render. */
    as: MdxHeadingTag;
  };

const headingVariant = {
  h1: "display-strong-xs",
  h2: "heading-strong-xl",
  h3: "heading-strong-l",
  h4: "heading-strong-m",
  h5: "heading-strong-s",
  h6: "heading-strong-xs",
} as const;

/**
 * A heading with an id and a link to itself, revealed on hover or focus.
 * The id comes from the heading's text unless MDX passes one (from
 * `rehype-slug`, say), so `HeadingNav` finds every section.
 */
export function MdxHeading(props: MdxHeadingProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "24", marginBottom: "12" });
  const { as, id, children, className, style } = rest;
  const label = textOf(children);
  const slug = id ?? slugify(label);

  return (
    <Row className={styles.heading} vertical="center" gap="8" {...spacing}>
      <Heading
        as={as}
        id={slug || undefined}
        textVariant={headingVariant[as]}
        className={className}
        style={style}
      >
        {children}
      </Heading>
      {slug ? <MdxHeadingAnchor id={slug} label={label} className={styles.anchor} /> : null}
    </Row>
  );
}

// ─── Text ───────────────────────────────────────────────────────────────────

// Components that render a block box. A paragraph holding one of these cannot
// be a <p>: `![alt](src)` on its own line reaches `p` as an image element, and
// Media renders a <div>.
const BLOCK_COMPONENTS = new Set<unknown>([
  Accordion,
  AccordionGroup,
  BlockQuote,
  Card,
  CodeBlock,
  Column,
  Feedback,
  Grid,
  Line,
  List,
  Media,
  OgCard,
  Row,
  Table,
]);

function isBlock(node: ReactNode): boolean {
  if (!isValidElement<{ src?: unknown }>(node)) return false;
  // Any component handed a `src` is an image, video or embed: the default
  // `img` component, or whatever an app replaced it with.
  return BLOCK_COMPONENTS.has(node.type) || typeof node.props.src === "string";
}

const isBlank = (node: ReactNode) => typeof node === "string" && node.trim() === "";

export type MdxParagraphProps = MdxElementProps<"p"> & MdxSpacingProps;

/**
 * Body text. A paragraph that is only an image (or another block component)
 * renders that block on its own; one that mixes text and blocks renders as a
 * `<div>`, so the markup is never a `<div>` inside a `<p>`.
 */
export function MdxParagraph(props: MdxParagraphProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "8", marginBottom: "12" });
  const { children, id, className, style } = rest;
  const nodes = Children.toArray(children);
  const blocks = nodes.filter(isBlock);

  if (blocks.length > 0 && nodes.every((node) => isBlock(node) || isBlank(node))) {
    return <>{children}</>;
  }

  return (
    <Text
      as={blocks.length > 0 ? "div" : "p"}
      id={id}
      className={className}
      textVariant="body-default-m"
      onBackground="neutral-medium"
      style={{ ...BODY_LINE_HEIGHT, ...style }}
      {...spacing}
    >
      {children}
    </Text>
  );
}

/** A link through `SmartLink`: the app's router for internal paths, a new tab for external URLs. */
export function MdxLink({ href, children, style, ...rest }: MdxElementProps<"a">) {
  if (!href) return <>{children}</>;

  return (
    <SmartLink href={href} style={{ textDecoration: "underline", ...style }} {...rest}>
      {children}
    </SmartLink>
  );
}

export type MdxInlineCodeProps = MdxElementProps<"code"> & MdxSpacingProps;

/** Inline code: `like this`. */
export function MdxInlineCode(props: MdxInlineCodeProps) {
  const { spacing, rest } = splitSpacing(props, {});
  const { children, className, style } = rest;
  return (
    <InlineCode className={className} style={style} {...spacing}>
      {children}
    </InlineCode>
  );
}

export type MdxBlockQuoteProps = MdxElementProps<"blockquote"> & MdxSpacingProps;

/**
 * `> A quote` through `BlockQuote`. The quote's paragraphs stay `<p>`s, set in
 * the body text style rather than BlockQuote's heading style.
 */
export function MdxBlockQuote(props: MdxBlockQuoteProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "16", marginBottom: "24" });
  const lines = Children.map(rest.children, (child) =>
    isValidElement<MdxParagraphProps>(child) && child.type === MdxParagraph ? (
      <Text
        as="p"
        textVariant="body-default-m"
        onBackground="neutral-medium"
        marginTop="8"
        marginBottom="12"
        style={BODY_LINE_HEIGHT}
      >
        {child.props.children}
      </Text>
    ) : (
      child
    ),
  );

  return (
    <BlockQuote className={rest.className} style={rest.style} {...spacing}>
      {lines}
    </BlockQuote>
  );
}

export type MdxHrProps = MdxElementProps<"hr"> & MdxSpacingProps;

/** A thematic break: `---`. */
export function MdxHr(props: MdxHrProps) {
  const { spacing, rest } = splitSpacing(props, { marginY: "32" });
  return <Line role="separator" className={rest.className} style={rest.style} {...spacing} />;
}

// ─── Lists ──────────────────────────────────────────────────────────────────

export type MdxListProps = MdxElementProps<"ol"> &
  MdxSpacingProps & {
    /** `ul` for `- item`, `ol` for `1. item`. */
    as?: "ul" | "ol";
  };

/** A list. An ordered one keeps its first number: `3. Three` starts at 3. */
export function MdxList(props: MdxListProps) {
  const { spacing, rest } = splitSpacing(props, {});
  const { as = "ul", children, className, style, start, reversed } = rest;
  // List types none of `<ol>`'s own attributes, but passes them to the element.
  const ordered: Pick<MdxElementProps<"ol">, "start" | "reversed"> = as === "ol"
    ? { start, reversed }
    : {};
  return (
    <List as={as} className={className} style={style} {...ordered} {...spacing}>
      {children}
    </List>
  );
}

export type MdxListItemProps = MdxElementProps<"li"> & MdxSpacingProps;

export function MdxListItem(props: MdxListItemProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "4", marginBottom: "8" });
  const { children, className, style, id } = rest;
  return (
    <ListItem id={id} className={className} style={{ ...BODY_LINE_HEIGHT, ...style }} {...spacing}>
      {children}
    </ListItem>
  );
}

// ─── Media and code ─────────────────────────────────────────────────────────

export type MdxImageProps = MdxElementProps<"img"> & MdxSpacingProps;

/**
 * `![alt](src)` through `Media`: the app's image adapter (next/image under
 * `/next`), click to enlarge. Only `src` and `alt` are read; an image element's
 * `loading` and `height` mean something else on Media.
 */
export function MdxImage(props: MdxImageProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "8", marginBottom: "16" });
  const { src, alt } = rest;
  if (typeof src !== "string" || src === "") return null;

  return (
    <Media
      src={src}
      alt={alt ?? ""}
      enlarge
      radius="m"
      border="neutral-alpha-medium"
      sizes="(max-width: 960px) 100vw, 960px"
      {...spacing}
    />
  );
}

type CodeElementProps = { className?: string; children?: ReactNode };

const isCodeElement = (node: ReactNode): node is ReactElement<CodeElementProps> =>
  isValidElement<CodeElementProps>(node);

const languageOf = (className: string | undefined) =>
  /(?:^|\s)language-(\S+)/.exec(className ?? "")?.[1];

export type MdxCodeBlockProps = MdxElementProps<"pre"> & MdxSpacingProps;

/**
 * A fenced code block through `CodeBlock`. MDX renders ```` ```ts ```` as
 * `<pre><code className="language-ts">`; the language and the source are read
 * off that inner element. Prism loads in the browser, only when a page has a
 * code block.
 */
export function MdxCodeBlock(props: MdxCodeBlockProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "8", marginBottom: "16" });
  const code = Children.toArray(rest.children).find(isCodeElement);
  const source = textOf(code ? code.props.children : rest.children).replace(/\n$/, "");
  const language = languageOf(code?.props.className) ?? "plaintext";
  const label =
    language === "plaintext" ? "Text" : `${language.charAt(0).toUpperCase()}${language.slice(1)}`;

  return (
    <CodeBlock
      className={rest.className}
      style={rest.style}
      codes={[{ code: source, language, label }]}
      {...spacing}
    />
  );
}

// ─── Tables ─────────────────────────────────────────────────────────────────

type CellProps = { children?: ReactNode; style?: CSSProperties; align?: string };
type SectionProps = { children?: ReactNode };

const elementsIn = (node: ReactNode) =>
  isValidElement<SectionProps>(node)
    ? Children.toArray(node.props.children).filter(isValidElement<CellProps>)
    : [];

const ALIGNMENTS = ["left", "center", "right"] as const;
type Alignment = (typeof ALIGNMENTS)[number];

const alignmentOf = (cell: ReactElement<CellProps>): Alignment | undefined => {
  const value = cell.props.style?.textAlign ?? cell.props.align;
  return ALIGNMENTS.find((alignment) => alignment === value);
};

export type MdxTableProps = MdxElementProps<"table"> & MdxSpacingProps;

/**
 * A GFM table (with `remark-gfm`) through `Table`. MDX hands over the
 * `thead`/`tbody`/`tr`/`th`/`td` elements; the header cells become `columns`
 * and each body row an array of cells, read by position, and a column's
 * `:---:` alignment carries over.
 */
export function MdxTable(props: MdxTableProps) {
  const { spacing, rest } = splitSpacing(props, { marginTop: "16", marginBottom: "16" });
  const sections = Children.toArray(rest.children).filter(isValidElement<SectionProps>);
  const head = sections.find((section) => section.type === "thead");
  const headerCells = elementsIn(elementsIn(head)[0]);
  const columns = headerCells.map((cell, index) => ({
    header: cell.props.children,
    key: `column-${index}`,
    align: alignmentOf(cell),
  }));
  const rows = sections
    .filter((section) => section !== head)
    .flatMap((section) => elementsIn(section))
    .map((row) => elementsIn(row).map((cell) => cell.props.children));

  return (
    <Table
      className={rest.className}
      style={rest.style}
      columns={columns}
      rows={rows}
      {...spacing}
    />
  );
}

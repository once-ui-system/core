import type { ElementType } from "react";
import { Accordion } from "../../components/Accordion";
import { AccordionGroup } from "../../components/AccordionGroup";
import { BlockQuote } from "../../components/BlockQuote";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Column } from "../../components/Column";
import { Feedback } from "../../components/Feedback";
import { Grid } from "../../components/Grid";
import { Heading } from "../../components/Heading";
import { Icon } from "../../components/Icon";
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
import { CodeBlock } from "../code/CodeBlock";
import {
  MdxBlockQuote,
  MdxCodeBlock,
  type MdxElementProps,
  MdxHeading,
  type MdxHeadingTag,
  MdxHr,
  MdxImage,
  MdxInlineCode,
  MdxLink,
  MdxList,
  MdxListItem,
  MdxParagraph,
  MdxTable,
  type MdxTag,
} from "./MdxElements";

/**
 * A component map for MDX content, as `next-mdx-remote`'s `components` prop
 * and `@next/mdx`'s `useMDXComponents` take it.
 *
 * An HTML tag key (`h2`, `a`, `img`…) replaces what Markdown renders for that
 * tag, and is typed against exactly the props MDX passes it: an override that
 * needs a prop Markdown cannot supply does not compile. Any other key is a
 * component the content can use by name (`<Feedback />`).
 */
export type MdxComponents = {
  [Tag in MdxTag]?: ElementType<MdxElementProps<Tag>>;
} & {
  [name: string]: ElementType;
};

function heading(as: MdxHeadingTag) {
  const Component = (props: MdxElementProps<MdxHeadingTag>) => <MdxHeading as={as} {...props} />;
  Component.displayName = `MdxHeading.${as}`;
  return Component;
}

const OrderedList = (props: MdxElementProps<"ol">) => <MdxList as="ol" {...props} />;
OrderedList.displayName = "MdxList.ol";

/** What Markdown renders, through Once UI. */
const elements = {
  h1: heading("h1"),
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  h5: heading("h5"),
  h6: heading("h6"),
  p: MdxParagraph,
  a: MdxLink,
  img: MdxImage,
  code: MdxInlineCode,
  pre: MdxCodeBlock,
  blockquote: MdxBlockQuote,
  ul: MdxList,
  ol: OrderedList,
  li: MdxListItem,
  table: MdxTable,
  hr: MdxHr,
} satisfies MdxComponents;

/**
 * The components content can use by name: the set every Once UI product
 * registered in its own MDX map.
 */
const tags = {
  Accordion,
  AccordionGroup,
  BlockQuote,
  Button,
  Card,
  CodeBlock,
  Column,
  Feedback,
  Grid,
  Heading,
  Icon,
  InlineCode,
  Line,
  List,
  ListItem,
  Media,
  OgCard,
  Row,
  SmartLink,
  Table,
  Text,
} satisfies MdxComponents;

/**
 * The default map: Markdown elements rendered with Once UI, and the common
 * Once UI components available as tags.
 *
 * ```tsx
 * <MDXRemote source={source} components={mdxComponents} />
 * ```
 */
export const mdxComponents: MdxComponents = { ...elements, ...tags };

/**
 * The default map with `overrides` applied: replace an element (`h2`, `a`,
 * `hr`…), register an app's own components, or map a tag back to plain HTML
 * (`{ hr: "hr" }`). An `undefined` entry is skipped rather than written, since
 * MDX would try to render it.
 *
 * ```tsx
 * const components = createMdxComponents({
 *   hr: () => <Line marginY="64" />,
 *   Pricing,
 * });
 * ```
 */
export function createMdxComponents(overrides: Partial<MdxComponents> = {}): MdxComponents {
  const components: MdxComponents = { ...mdxComponents };
  for (const [name, component] of Object.entries(overrides)) {
    if (component !== undefined) components[name] = component;
  }
  return components;
}

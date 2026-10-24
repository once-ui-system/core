import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Column, Heading, SmartLink, Text } from "@once-ui-system/core";

/** Elements a post's Markdown renders as: Once UI type instead of bare HTML. */
const components = {
  h2: (props: { children?: ReactNode }) => (
    <Heading as="h2" variant="display-strong-xs" marginTop="24">
      {props.children}
    </Heading>
  ),
  h3: (props: { children?: ReactNode }) => (
    <Heading as="h3" variant="heading-strong-m" marginTop="16">
      {props.children}
    </Heading>
  ),
  p: (props: { children?: ReactNode }) => (
    <Text as="p" variant="body-default-l" onBackground="neutral-medium">
      {props.children}
    </Text>
  ),
  a: (props: { href?: string; children?: ReactNode }) => (
    <SmartLink href={props.href ?? "#"}>{props.children}</SmartLink>
  ),
  ul: (props: { children?: ReactNode }) => (
    <Column as="ul" gap="8" paddingLeft="24">
      {props.children}
    </Column>
  ),
};

/** Renders the body of a post (the MDX below its frontmatter). */
export function PostBody({ source }: { source: string }) {
  return (
    <Column fillWidth gap="16">
      <MDXRemote source={source} components={components} />
    </Column>
  );
}

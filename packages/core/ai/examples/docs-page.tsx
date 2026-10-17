/**
 * Gold example: docs page
 * Target: an MDX article with a breadcrumb trail, its title and summary, the
 * body rendered through Once UI, and an on-page heading nav beside it.
 *
 * The Markdown goes through the map from `@once-ui-system/core/mdx`, never a
 * hand-written one: headings get ids and copy-link anchors (which `HeadingNav`
 * reads), links go through `SmartLink`, images through `Media`, fenced code
 * through `CodeBlock`, GFM tables through `Table`. `createMdxComponents`
 * replaces an element or registers the app's own tags; each override is typed
 * against the props MDX passes, so it needs no casts.
 *
 * `Content` is a compiled MDX module's default export (`@next/mdx`). With
 * next-mdx-remote it is `<MDXRemote source={source} components={components} />`
 * instead. The anchors confirm a copy with a toast, so render inside
 * `ToastProvider`; in Next.js, `LayoutProvider` from `@once-ui-system/core/next`
 * makes the links and images next/link and next/image.
 */
import {
  Breadcrumbs,
  Column,
  Feedback,
  Heading,
  HeadingNav,
  Row,
  Text,
} from "@once-ui-system/core";
import { createMdxComponents, type MdxComponents, MdxHeading } from "@once-ui-system/core/mdx";
import type { ComponentType, ReactNode } from "react";

const components = createMdxComponents({
  // Keep the element, give a section more room above it.
  h2: (props) => <MdxHeading as="h2" marginTop="48" {...props} />,
  // An app tag: <Note>…</Note> in the content.
  Note: ({ children }: { children?: ReactNode }) => <Feedback marginY="16">{children}</Feedback>,
});

export function DocsPageExample({
  title,
  summary,
  section,
  Content,
}: {
  title: string;
  summary: string;
  section: { label: string; href: string };
  Content: ComponentType<{ components?: MdxComponents }>;
}) {
  return (
    <Row as="main" fillWidth horizontal="center" gap="48" paddingX="24" paddingY="48">
      <Column as="article" maxWidth="m">
        <Breadcrumbs
          items={[
            { label: "Docs", href: "/docs" },
            { label: section.label, href: section.href },
            { label: title },
          ]}
          paddingBottom="24"
        />
        <Column gap="12" paddingBottom="16">
          <Heading as="h1" variant="display-strong-s">
            {title}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {summary}
          </Text>
        </Column>
        <Content components={components} />
      </Column>
      <Column as="aside" maxWidth="16rem" fitHeight position="sticky" top="80" m={{ hide: true }}>
        <HeadingNav />
      </Column>
    </Row>
  );
}

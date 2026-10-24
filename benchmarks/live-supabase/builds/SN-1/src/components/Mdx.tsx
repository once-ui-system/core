import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import type React from "react";
import { isValidElement, type ReactNode } from "react";

import { Heading, HeadingLink, Text, InlineCode, type TextProps, type MediaProps, Accordion, AccordionGroup, Table, Feedback, Button, Card, Grid, Row, Column, Icon, Media, SmartLink, List, ListItem, Line, BlockQuote } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";
import { schema } from "@/resources";

/** `<ProductName />` and `<ContactEmail />` in MDX read from schema in once-ui.config.js. */
const ProductName = () => <>{schema.name}</>;
const ContactEmail = () => <SmartLink href={`mailto:${schema.email}`}>{schema.email}</SmartLink>;

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (href.startsWith("/")) {
    return (
      <SmartLink href={href} {...props}>
        {children}
      </SmartLink>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function createImage({ alt, src, ...props }: MediaProps & { src: string }) {
  if (!src) {
    console.error("Media requires a valid 'src' property.");
    return null;
  }

  return (
    <Media
      marginTop="8"
      marginBottom="16"
      enlarge
      radius="m"
      border="neutral-alpha-medium"
      sizes="(max-width: 960px) 100vw, 960px"
      alt={alt}
      src={src}
      {...props}
    />
  );
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const CustomHeading = ({
    children,
    ...props
  }: Omit<React.ComponentProps<typeof HeadingLink>, "as" | "id">) => {
    const slug = children as string;
    return (
      <HeadingLink marginTop="24" marginBottom="12" as={as} id={slug} {...props}>
        {children}
      </HeadingLink>
    );
  };

  CustomHeading.displayName = `${as}`;

  return CustomHeading;
}

function createParagraph({ children }: TextProps) {
  return (
    <Text
      style={{ lineHeight: "175%" }}
      variant="body-default-m"
      onBackground="neutral-medium"
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </Text>
  );
}

function createBlockquote({ children }: { children: ReactNode }) {
  return <BlockQuote separator="none" marginY="64">{children}</BlockQuote>;
}

function createInlineCode({ children }: { children: ReactNode }) {
  return <InlineCode>{children}</InlineCode>;
}

function createCodeBlock(props: React.ComponentProps<"pre">) {
  // For pre tags that contain code blocks
  if (isValidElement<{ className?: string; children: string }>(props.children) && props.children.props.className) {
    const { className, children } = props.children.props;

    // Extract language from className (format: language-xxx)
    const language = className.replace("language-", "");
    const label = language.charAt(0).toUpperCase() + language.slice(1);

    return (
      <CodeBlock
        marginY="24"
        codes={[
          {
            code: children,
            language,
            label,
          },
        ]}
        copyButton={true}
      />
    );
  }

  // Fallback for other pre tags or empty code blocks
  return <pre {...props} />;
}

function createList({ children }: { children: ReactNode }) {
  return <List>{children}</List>;
}

function createListItem({ children }: { children: ReactNode }) {
  return (
    <ListItem marginTop="4" marginBottom="8" style={{ lineHeight: "175%" }}>
      {children}
    </ListItem>
  );
}

function createHR() {
  return (
    <Row fillWidth horizontal="center" paddingY="64">
      <Line maxWidth={4} />
    </Row>
  );
}

const components = {
  p: createParagraph,
  h1: createHeading("h1"),
  h2: createHeading("h2"),
  h3: createHeading("h3"),
  h4: createHeading("h4"),
  h5: createHeading("h5"),
  h6: createHeading("h6"),
  img: createImage,
  a: CustomLink,
  code: createInlineCode,
  pre: createCodeBlock,
  ol: createList,
  ul: createList,
  li: createListItem,
  hr: createHR,
  blockquote: createBlockquote,
  Heading,
  Text,
  CodeBlock,
  InlineCode,
  Accordion,
  AccordionGroup,
  Table,
  Feedback,
  Button,
  Card,
  Grid,
  Row,
  Column,
  Icon,
  Media,
  SmartLink,
  ProductName,
  ContactEmail,
};

type CustomMDXProps = MDXRemoteProps & {
  components?: typeof components;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
  <MDXRemote
      {...props}
      options={{ blockJS: false }} 
      components={{
        ...components,
        ...(props.components || {})
      }}
    />
  )
}
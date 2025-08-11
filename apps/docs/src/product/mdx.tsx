import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
type MDXComponents = React.ComponentProps<typeof MDXRemote>['components'];
import React, { ReactNode } from "react";

import * as productComponents from "@/product";
import * as allComponents from "@once-ui-system/core";
import type { MediaProps, TextProps } from "@once-ui-system/core";


type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

const onceUIComponents = allComponents;
  

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (href.startsWith("/")) {
    return (
      <onceUIComponents.SmartLink href={href} {...props}>
        {children}
      </onceUIComponents.SmartLink>
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
    <onceUIComponents.Media
      marginTop="8"
      marginBottom="16"
      enlarge
      radius="m"
      aspectRatio="16 / 9"
      border="neutral-alpha-medium"
      sizes="(max-width: 960px) 100vw, 960px"
      alt={alt}
      src={src}
      {...props}
    />
  );
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  // Use HeadingLinkProps to ensure type compatibility
  const CustomHeading = ({ children, ...props }: Omit<React.ComponentProps<typeof onceUIComponents.HeadingLink>, 'as' | 'id'>) => {
    const slug = slugify(children as string);
    return (
      <onceUIComponents.HeadingLink
        marginTop="24"
        marginBottom="12"
        as={as}
        id={slug}
        {...props}
      >
        {children}
      </onceUIComponents.HeadingLink>
    );
  };

  CustomHeading.displayName = `${as}`;

  return CustomHeading;
}

function createParagraph({ children }: TextProps) {
  return (
    <onceUIComponents.Text
      style={{ lineHeight: "175%" }}
      variant="body-default-m"
      onBackground="neutral-medium"
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </onceUIComponents.Text>
  );
}

function createInlineCode({ children }: { children: ReactNode }) {
  return <onceUIComponents.InlineCode>{children}</onceUIComponents.InlineCode>;
}

function createBlockQuote({ children }: { children: ReactNode }) {
  return (
    <onceUIComponents.BlockQuote
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </onceUIComponents.BlockQuote>
  );
}

function createList({ children }: { children: ReactNode }) {
  return (
    <onceUIComponents.List
    >
      {children}
    </onceUIComponents.List>
  );
}

function createListItem({ children }: { children: ReactNode }) {
  return (
    <onceUIComponents.ListItem
      marginTop="4"
      marginBottom="8"
    >
      {children}
    </onceUIComponents.ListItem>
  );
}

function createCodeBlock(props: any) {
  // For pre tags that contain code blocks
  if (props.children && props.children.props && props.children.props.className) {
    const { className, children } = props.children.props;
    
    // Extract language from className (format: language-xxx)
    const language = className.replace('language-', '');
    const label = language.charAt(0).toUpperCase() + language.slice(1);
    
    return (
      <onceUIComponents.CodeBlock
        marginTop="8"
        marginBottom="16"
        codes={[
          {
            code: children,
            language,
            label
          }
        ]}
        copyButton={true}
      />
    );
  }
  
  // Fallback for other pre tags or empty code blocks
  return <pre {...props} />;
}

function createHr() {
  return <onceUIComponents.Line />;
}

// @ts-ignore
const mdxComponents: MDXComponents = {
  p: createParagraph as any,
  h1: createHeading("h1") as any,
  h2: createHeading("h2") as any,
  h3: createHeading("h3") as any,
  h4: createHeading("h4") as any,
  h5: createHeading("h5") as any,
  h6: createHeading("h6") as any,
  img: createImage as any,
  a: CustomLink as any,
  code: createInlineCode as any,
  pre: createCodeBlock as any,
  blockquote: createBlockQuote as any,
  ul: createList as any,
  ol: createList as any,
  li: createListItem as any,
  hr: createHr as any,
  ...onceUIComponents,
  ...productComponents,
};

type CustomMDXProps = Omit<MDXRemoteProps, 'components'> & {
  components?: Partial<MDXComponents>;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote 
      {...props} 
      components={{ 
        ...mdxComponents, 
        ...(props.components || {}) 
      }} 
    />
  );
}
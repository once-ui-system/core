import type { MDXComponents } from "mdx/types";

// Styles for elements written in MDX posts.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-10 mb-4 text-3xl font-semibold tracking-tight">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="mt-8 mb-2 text-xl font-semibold">{children}</h3>,
    p: ({ children }) => <p className="my-4 leading-7 text-muted-foreground">{children}</p>,
    ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-muted-foreground">{children}</ol>,
    a: ({ href, children }) => (
      <a href={href} className="text-brand underline underline-offset-4 hover:text-brand-accent">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    ...components,
  };
}

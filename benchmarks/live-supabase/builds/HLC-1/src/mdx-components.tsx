import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="mt-10 text-3xl font-semibold tracking-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-10 text-2xl font-semibold tracking-tight">{children}</h2>,
    p: ({ children }) => <p className="mt-4 leading-7 text-muted-foreground">{children}</p>,
    a: ({ href, children }) => (
      <a href={href} className="font-medium text-primary underline-offset-4 hover:underline">
        {children}
      </a>
    ),
    ...components,
  };
}

import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    h1: (props: ComponentPropsWithoutRef<"h1">) => (
      <h1 className="mt-10 text-3xl font-semibold tracking-tight" {...props} />
    ),
    h2: (props: ComponentPropsWithoutRef<"h2">) => (
      <h2 className="mt-10 text-2xl font-semibold tracking-tight" {...props} />
    ),
    h3: (props: ComponentPropsWithoutRef<"h3">) => (
      <h3 className="mt-8 text-xl font-semibold" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => (
      <p className="my-5 leading-7 text-muted-foreground" {...props} />
    ),
    a: (props: ComponentPropsWithoutRef<"a">) => (
      <a className="font-medium text-primary underline underline-offset-4" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
      <ul className="my-5 list-disc space-y-2 pl-6 text-muted-foreground" {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<"ol">) => (
      <ol className="my-5 list-decimal space-y-2 pl-6 text-muted-foreground" {...props} />
    ),
    code: (props: ComponentPropsWithoutRef<"code">) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
    ),
    ...components,
  };
}

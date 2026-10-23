import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    p: (props) => <p className="mt-4 leading-7" {...props} />,
    ...components,
  };
}

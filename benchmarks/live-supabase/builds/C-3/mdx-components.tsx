import type { MDXComponents } from "mdx/types";

export function useMDXComponents(): MDXComponents {
  return {
    p: (props) => <p className="leading-7 [&:not(:first-child)]:mt-5" {...props} />,
    h2: (props) => <h2 className="mt-8 text-2xl font-semibold" {...props} />,
  };
}

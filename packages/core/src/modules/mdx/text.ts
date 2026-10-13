import { isValidElement, type ReactNode } from "react";

/**
 * The text a reader sees in a React node, flattened.
 *
 * A Markdown heading is not always a string: `## Why \`overflow\`` reaches the
 * heading component as an array of a string and an inline-code element. The
 * slug and the anchor's label are built from this, never from `children`
 * directly.
 */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") {
    return String(node);
  }
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * The fragment id for a heading's text: "Get started & deploy" becomes
 * "get-started-and-deploy". The same rule Studio and the docs site have used,
 * so their existing deep links keep resolving.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

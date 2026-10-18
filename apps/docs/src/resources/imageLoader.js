/**
 * next/image loader for the 1.x docs, which are served under /v1.
 *
 * Next adds `basePath` to the optimizer's own URL but not to a local `src`,
 * so "/images/x.jpg" would be looked up outside /v1. Local images are served
 * as they are, from under the path.
 */
const basePath = process.env.NEXT_PUBLIC_DOCS_BASE_PATH || "";

export default function imageLoader({ src, width }) {
  if (!src.startsWith("/") || src.startsWith(`${basePath}/`)) return src;
  return `${basePath}${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}

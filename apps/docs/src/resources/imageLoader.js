/**
 * next/image loader for a docs version served under a path (/beta, /v1).
 *
 * Next adds `basePath` to the optimizer's own URL but not to a local `src`,
 * so "/images/x.jpg" would be looked up outside this build. These builds
 * serve their images as they are, from under their path; the stable build
 * keeps Next's optimizer.
 */
const basePath = process.env.NEXT_PUBLIC_DOCS_BASE_PATH || "";

export default function imageLoader({ src, width }) {
  if (!src.startsWith("/") || src.startsWith(`${basePath}/`)) return src;
  return `${basePath}${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}

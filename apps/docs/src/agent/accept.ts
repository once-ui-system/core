/** Edge-safe Accept header check for Markdown for Agents */
export function acceptsMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) return false;
  return acceptHeader.split(",").some((part) => {
    const value = part.split(";")[0]?.trim().toLowerCase();
    return value === "text/markdown" || value === "text/x-markdown";
  });
}

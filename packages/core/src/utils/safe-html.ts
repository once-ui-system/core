/**
 * Escapes HTML special characters for safe insertion into HTML text nodes
 * or attributes when content is not already sanitized HTML.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Serializes a value for safe embedding inside HTML <script> tags.
 * JSON.stringify escapes quotes and backslashes but not `<`, which allows
 * `</script>` breakout when prop values are attacker-controlled.
 */
export function safeScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

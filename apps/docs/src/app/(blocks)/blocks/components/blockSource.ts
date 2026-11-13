const ONCE_UI_IMPORT =
  /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']@once-ui-system\/core(?:\/[\w-]+)*["']/g;

/**
 * The Once UI components a block's source imports, in first-seen order.
 *
 * Read from the code itself rather than kept by hand, so the "Built with" list
 * cannot drift from what a block actually uses. Type-only specifiers and
 * non-component exports (hooks, helpers, constants) are left out.
 */
export function onceUIComponentsIn(sources: string[]): string[] {
  const names = new Set<string>();
  for (const source of sources) {
    for (const match of source.matchAll(ONCE_UI_IMPORT)) {
      for (const raw of match[1].split(",")) {
        const specifier = raw.trim();
        if (!specifier || specifier.startsWith("type ")) continue;
        const name = specifier.split(/\s+as\s+/)[0].trim();
        if (/^[A-Z][A-Za-z0-9]*$/.test(name) && !name.endsWith("Props")) names.add(name);
      }
    }
  }
  return [...names];
}

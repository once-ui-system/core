/**
 * Copies `text` to the clipboard and resolves whether it worked.
 *
 * The Clipboard API only exists in a secure context (https, localhost), so a
 * page served over plain http, such as a dev server opened from a phone on
 * the LAN, has no `navigator.clipboard`. There, and when the API refuses, the
 * text goes through a hidden textarea and `document.execCommand("copy")`:
 * deprecated, but still supported everywhere and the only way to copy
 * outside a secure context. Call it from the click or key handler, while the
 * browser still counts the copy as the visitor's own.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Refused (permissions policy, a document without focus): try the fallback.
    }
  }
  return copyWithTextarea(text);
}

function copyWithTextarea(text: string): boolean {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }

  // Selecting the textarea takes focus and the page's selection; both go
  // back afterwards, so the button the visitor pressed keeps focus.
  const active = document.activeElement;
  const selection = document.getSelection();
  const ranges: Range[] = [];
  if (selection) {
    // Clones: the live ranges move with the selection while the textarea has it.
    for (let i = 0; i < selection.rangeCount; i++)
      ranges.push(selection.getRangeAt(i).cloneRange());
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.tabIndex = -1;
  // Fixed at the corner so focusing it never scrolls the page; 12pt keeps
  // iOS from zooming in on focus.
  Object.assign(textarea.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "1px",
    height: "1px",
    padding: "0",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
    fontSize: "12pt",
  });
  document.body.appendChild(textarea);

  let copied = false;
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    // iOS selects nothing with select() alone.
    textarea.setSelectionRange(0, text.length);
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    textarea.remove();
    // Focus first: focusing can move the selection, so it is restored last.
    if (active instanceof HTMLElement) active.focus({ preventScroll: true });
    if (selection) {
      selection.removeAllRanges();
      for (const range of ranges) selection.addRange(range);
    }
  }
  return copied;
}

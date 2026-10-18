/**
 * Once UI 2.x → 3.0 codemod: the expression scanner the passes share.
 *
 * Strings, template literals, comments and regex literals are skipped, so
 * brackets inside them never count; the helpers below find the bracket
 * that closes another, the parts of a list, the entries of an object
 * literal, and whether a name is bound a second time in a file.
 */
import { skipRegex } from "./codemod-2.0.mjs";

/** Skip a string or comment starting at `i`; the index after it, or `i` when there is none. */
export function skipLexeme(text, i) {
  const c = text[i];
  if (c === '"' || c === "'" || c === "`") {
    let j = i + 1;
    while (j < text.length && !(text[j] === c && text[j - 1] !== "\\")) j++;
    return j + 1;
  }
  if (c === "/" && text[i + 1] === "/") {
    const nl = text.indexOf("\n", i);
    return nl < 0 ? text.length : nl;
  }
  if (c === "/" && text[i + 1] === "*") {
    const close = text.indexOf("*/", i + 2);
    return close < 0 ? text.length : close + 2;
  }
  return skipRegex(text, i);
}

/** `text` with its offsets, trimmed of whitespace and of parentheses around all of it. */
export function trimmed(expr, at, end) {
  for (;;) {
    while (at < end && /\s/.test(expr[at])) at++;
    while (end > at && /\s/.test(expr[end - 1])) end--;
    if (expr[at] !== "(" || expr[end - 1] !== ")" || closing(expr, at) !== end - 1) return { at, end };
    at++;
    end--;
  }
}

/** The index of the bracket that closes the one at `i`. */
export function closing(expr, i) {
  let depth = 0;
  for (let j = i; j < expr.length; j++) {
    const past = skipLexeme(expr, j);
    if (past !== j) {
      j = past - 1;
      continue;
    }
    if ("([{".includes(expr[j])) depth++;
    else if (")]}".includes(expr[j]) && --depth === 0) return j;
  }
  return -1;
}

/**
 * The entries of an object literal `{ … }` that starts at `text[0]`: each
 * key with the offsets of its value. A spread, a computed key or a method is
 * reported as `opaque` beside the entries that could be read.
 */
export function objectEntries(text) {
  const entries = [];
  let opaque = false;
  let i = 1;
  const end = text.length - 1;
  while (i < end) {
    const past = skipLexeme(text, i);
    if (past !== i && !/["'`]/.test(text[i])) {
      i = past;
      continue;
    }
    if (/[\s,]/.test(text[i])) {
      i++;
      continue;
    }
    let key;
    if (/["']/.test(text[i])) {
      const close = skipLexeme(text, i);
      key = text.slice(i + 1, close - 1);
      i = close;
    } else if (/[A-Za-z_$]/.test(text[i])) {
      let j = i;
      while (j < end && /[\w$]/.test(text[j])) j++;
      key = text.slice(i, j);
      i = j;
    } else {
      opaque = true; // `...spread` or `[computed]`
      key = null;
    }
    while (i < end && /\s/.test(text[i])) i++;
    let valueAt = i;
    if (key !== null && text[i] === ":") valueAt = i + 1;
    else if (key !== null && (text[i] === "," || i >= end)) {
      entries.push({ key, value: key, at: valueAt - key.length, end: valueAt, shorthand: true });
      continue;
    } else if (key !== null) opaque = true; // a method or a getter
    let j = valueAt;
    let depth = 0;
    while (j < end) {
      const skip = skipLexeme(text, j);
      if (skip !== j) {
        j = skip;
        continue;
      }
      const c = text[j];
      if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) depth--;
      else if (c === "," && depth === 0) break;
      j++;
    }
    if (key !== null && text[valueAt - 1] === ":") {
      let a = valueAt;
      let b = j;
      while (a < b && /\s/.test(text[a])) a++;
      while (b > a && /\s/.test(text[b - 1])) b--;
      entries.push({ key, value: text.slice(a, b), at: a, end: b });
    }
    i = j + 1;
  }
  return { entries, opaque };
}

/** The comma-separated parts between the brackets at `open` and `close`, as offsets. */
export function partsBetween(src, open, close) {
  const parts = [];
  let start = open + 1;
  let depth = 0;
  for (let i = open + 1; i < close; i++) {
    const past = skipLexeme(src, i);
    if (past !== i) {
      i = past - 1;
      continue;
    }
    const c = src[i];
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === "," && depth === 0) {
      parts.push({ at: start, end: i });
      start = i + 1;
    }
  }
  parts.push({ at: start, end: close });
  return parts.map((p) => trimmed(src, p.at, p.end)).filter((p) => p.end > p.at);
}

/** The index of the first top-level `ch` in `src` between `at` and `end`, or -1. */
export function topLevel(src, at, end, test) {
  let depth = 0;
  for (let i = at; i < end; i++) {
    const past = skipLexeme(src, i);
    if (past !== i) {
      i = past - 1;
      continue;
    }
    const c = src[i];
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (depth === 0 && test(i)) return i;
  }
  return -1;
}

/**
 * Whether `name` may be bound again somewhere in `code` (comments and strings
 * blanked) besides the declaration at `declAt`: as a parameter, in a
 * destructuring pattern, a catch clause. Read conservatively: a name passed
 * as an argument or listed in an array or object counts too.
 */
export function boundElsewhere(code, name, declAt) {
  for (const m of code.matchAll(new RegExp(`(?<![\\w$.])${name.replace(/\$/g, "\\$")}(?![\\w$])`, "g"))) {
    if (m.index >= declAt && m.index < declAt + 6 + name.length + 1) continue; // `const NAME`
    let i = m.index - 1;
    while (i >= 0 && /\s/.test(code[i])) i--;
    let j = m.index + name.length;
    while (j < code.length && /\s/.test(code[j])) j++;
    const prev = code[i] ?? "";
    const next = code[j] ?? "";
    if (code.startsWith("=>", j)) return true;
    // `={NAME}` and `={NAME …}`: a JSX attribute reads it.
    if (prev === "{" && code[i - 1] === "=") continue;
    if (!((/[([{,]/.test(prev) || code.slice(i - 2, i + 1) === "...") && /[,)}\]=:]/.test(next) && !code.startsWith("==", j))) continue;
    // In a list: a pattern when its brackets are followed by what follows a
    // parameter list or a destructuring (`) =>`, `) {`, `} =`, `] =`).
    let depth = 0;
    let open = -1;
    for (let k = m.index - 1; k >= 0; k--) {
      if (")]}".includes(code[k])) depth++;
      else if ("([{".includes(code[k])) {
        if (depth === 0) {
          open = k;
          break;
        }
        depth--;
      }
    }
    if (open < 0) return true;
    const close = closing(code, open);
    if (close < 0) return true;
    const after = code.slice(close + 1, close + 40);
    if (code[open] === "(" && /^\s*(=>|\{|:)/.test(after)) return true;
    if (code[open] !== "(" && /^\s*(=(?![=>])|\)|:)/.test(after)) return true;
    if (code[open] !== "(" && /(\(|,)\s*$/.test(code.slice(0, open))) {
      // A pattern inside a parameter list: `({ W }) =>`, `(a, [W]) =>`.
      let d = 0;
      for (let k = open - 1; k >= 0; k--) {
        if (")]}".includes(code[k])) d++;
        else if ("([{".includes(code[k])) {
          if (d === 0) {
            if (code[k] === "(" && /^\s*(=>|\{|:)/.test(code.slice(closing(code, k) + 1, closing(code, k) + 40))) return true;
            break;
          }
          d--;
        }
      }
    }
  }
  return false;
}


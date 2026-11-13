#!/usr/bin/env node
/**
 * Rewrites every `export * from "./x.js"` in the built JavaScript as a list of
 * the names it carries: `export { Button, ButtonProps… } from "./x.js"`.
 *
 * Why: under Turbopack (Next 16's default build), a server component that
 * imports one client component from a star-export barrel ships every client
 * component the barrel reaches, with all their CSS. With named re-exports it
 * ships only the ones the page imports. Measured on a page with a Button and
 * a Column: component CSS 92 KB -> 9 KB, page JS 1.15 MB -> 0.67 MB.
 *
 * The sources keep their star exports (and the `.d.ts` files, which bundlers
 * never follow for code, keep theirs), so nothing changes for authors; only
 * the emitted `.js` barrels do.
 *
 * Usage:  node scripts/flatten-barrels.mjs [distDir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const STAR = /^export \* from "([^"]+)";$/gm;

/** Resolve a relative specifier the way Node resolves a built ESM import. */
function resolve(from, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(from), specifier);
  for (const candidate of [base, `${base}.js`, path.join(base, "index.js")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`${path.relative(ROOT, from)}: cannot resolve ${specifier}`);
}

const cache = new Map();

/** A declaration with `export` and without `default`. */
const isExported = (node) =>
  ts.canHaveModifiers(node) &&
  ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
  !ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

/**
 * The runtime names a built module exports, each mapped to the file that
 * declares it (so the same binding reached twice is not a conflict).
 */
export function exportedNames(file) {
  if (cache.has(file)) return cache.get(file);
  const names = new Map();
  cache.set(file, names);
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest);
  const starred = new Map();
  const ambiguous = new Set();

  for (const node of source.statements) {
    if (ts.isExportDeclaration(node)) {
      if (node.isTypeOnly) continue;
      const specifier =
        node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : null;
      const clause = node.exportClause;
      if (!clause) {
        // `export * from`: every name of the target but `default`.
        const target = resolve(file, specifier);
        if (!target)
          throw new Error(`${path.relative(ROOT, file)}: star export of a package (${specifier})`);
        for (const [name, origin] of exportedNames(target)) {
          if (starred.has(name) && starred.get(name) !== origin) ambiguous.add(name);
          else starred.set(name, origin);
        }
      } else if (ts.isNamespaceExport(clause)) {
        names.set(clause.name.text, file);
      } else {
        for (const element of clause.elements) {
          if (element.isTypeOnly) continue;
          const exported = element.name.text;
          if (exported === "default") continue;
          let origin = file;
          if (specifier?.startsWith(".")) {
            const local = (element.propertyName ?? element.name).text;
            origin = exportedNames(resolve(file, specifier)).get(local) ?? file;
          }
          names.set(exported, origin);
        }
      }
    } else if (isExported(node)) {
      if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) names.set(declaration.name.text, file);
        }
      } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
        names.set(node.name.text, file);
      }
    }
  }
  // A module's own exports win over star exports; a name two stars disagree
  // on is not exported at all (the ES module rule).
  for (const [name, origin] of starred) {
    if (!names.has(name) && !ambiguous.has(name)) names.set(name, origin);
  }
  return names;
}

/** Rewrite one built file's star exports; returns how many it rewrote. */
export function flattenFile(file) {
  const text = fs.readFileSync(file, "utf8");
  let count = 0;
  const own = new Set();
  // Names the file exports itself shadow the same names from its stars.
  const source = ts.createSourceFile(file, text.replace(STAR, ""), ts.ScriptTarget.Latest);
  for (const node of source.statements) {
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) own.add(element.name.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamespaceExport(node.exportClause)
    ) {
      own.add(node.exportClause.name.text);
    } else if (isExported(node)) {
      if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) own.add(declaration.name.text);
        }
      } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
        own.add(node.name.text);
      }
    }
  }
  // Names that two of this file's stars disagree on are dropped, as above.
  const seen = new Map();
  const ambiguous = new Set();
  for (const [, specifier] of text.matchAll(STAR)) {
    for (const [name, origin] of exportedNames(resolve(file, specifier))) {
      if (seen.has(name) && seen.get(name) !== origin) ambiguous.add(name);
      else seen.set(name, origin);
    }
  }
  const emitted = new Set();
  const out = text.replace(STAR, (_line, specifier) => {
    count++;
    const list = [...exportedNames(resolve(file, specifier)).keys()].filter(
      (name) => !own.has(name) && !ambiguous.has(name) && !emitted.has(name),
    );
    for (const name of list) emitted.add(name);
    // A module with no runtime exports (types only) needs no line at all.
    return list.length ? `export { ${list.join(", ")} } from "${specifier}";` : "";
  });
  if (count) fs.writeFileSync(file, out);
  return count;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dist = path.resolve(process.argv[2] ?? path.join(ROOT, "dist"));
  const files = walk(dist).filter((file) =>
    fs.readFileSync(file, "utf8").includes('export * from "'),
  );
  // Work out every file's names before rewriting any, so each rewrite reads
  // the original star exports of the files below it.
  for (const file of files) exportedNames(file);
  let total = 0;
  for (const file of files) total += flattenFile(file);
  console.log(
    `flatten-barrels: ${total} star exports in ${files.length} files rewritten as named exports`,
  );
}

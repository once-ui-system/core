/**
 * Copy every block's source into `public/blocks`, so the surface can fetch it.
 *
 * The code tabs show the file a reader would paste into their own project, so
 * what they see has to be the file itself rather than a second copy kept in
 * step by hand. Serving the module sources as static text is the cheapest way
 * to guarantee that: the page fetches `/blocks/<name>.tsx` and prints exactly
 * what is in `src/blocks/modules`.
 *
 * Runs before `dev` and `build`. The output is generated, and git ignores it.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

const source = "src/blocks/modules";
const destination = "public/blocks";
const extensions = [".ts", ".tsx", ".scss", ".css"];

function collect(directory) {
  const found = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) found.push(...collect(path));
    else if (extensions.includes(extname(entry))) found.push(path);
  }
  return found;
}

if (!existsSync(source)) {
  console.error(`copy-blocks: ${source} does not exist`);
  process.exit(1);
}

mkdirSync(destination, { recursive: true });

const files = collect(source);
for (const file of files) {
  const target = join(destination, relative(source, file));
  mkdirSync(dirname(target), { recursive: true });
  cpSync(file, target);
}

console.log(`copy-blocks: copied ${files.length} files into ${destination}`);

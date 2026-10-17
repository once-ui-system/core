/**
 * Builds dist/: ESM and CommonJS bundles of src/ with the token export inlined
 * (foundations is private, so its JSON cannot be a runtime dependency), type
 * declarations from tsc, and a copy of the export as `tokens.json`.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

rmSync(join(ROOT, "dist"), { recursive: true, force: true });

const shared = {
  entryPoints: [join(ROOT, "src/index.ts")],
  bundle: true,
  // Metro resolves these from the app; bundling them would ship a second React.
  external: ["react", "react/jsx-runtime", "react-native"],
  jsx: "automatic",
  target: "es2022",
  platform: "neutral",
  mainFields: ["module", "main"],
  logLevel: "warning",
};
await build({ ...shared, format: "esm", outfile: join(ROOT, "dist/index.js") });
await build({ ...shared, format: "cjs", outfile: join(ROOT, "dist/index.cjs") });

execFileSync(
  process.execPath,
  [require.resolve("typescript/bin/tsc"), "-p", join(ROOT, "tsconfig.build.json")],
  { stdio: "inherit" },
);

mkdirSync(join(ROOT, "dist"), { recursive: true });
copyFileSync(
  require.resolve("@once-ui-system/foundations/tokens.json"),
  join(ROOT, "dist/tokens.json"),
);
console.log("built @once-ui-system/native -> dist/");

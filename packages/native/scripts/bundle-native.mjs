/**
 * Builds the demo the way a React Native app ships it: Metro bundles
 * demo-src/native.tsx against the real `react-native` package (not
 * react-native-web) for Android and iOS, and Hermes compiles each bundle to
 * bytecode. A component that imports something React Native does not have,
 * or code Hermes cannot compile, fails here instead of on a phone.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(ROOT, "../..");
const OUT = join(ROOT, "native-build");
mkdirSync(OUT, { recursive: true });

const Metro = require("metro");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const hermesc = join(
  dirname(
    require.resolve("hermes-compiler/package.json", {
      paths: [dirname(require.resolve("react-native/package.json"))],
    }),
  ),
  "hermesc/linux64-bin/hermesc",
);

const config = mergeConfig(getDefaultConfig(ROOT), {
  projectRoot: ROOT,
  watchFolders: [REPO],
  resolver: {
    nodeModulesPaths: [join(ROOT, "node_modules"), join(REPO, "node_modules")],
    // pnpm links packages; Metro must follow the links to the store.
    unstable_enableSymlinks: true,
  },
});

for (const platform of ["android", "ios"]) {
  const bundle = join(OUT, `demo.${platform}.js`);
  await Metro.runBuild(await Metro.loadConfig({ config: undefined }, config), {
    entry: "demo-src/native.tsx",
    platform,
    dev: false,
    minify: true,
    out: bundle,
  });
  const hbc = join(OUT, `demo.${platform}.hbc`);
  execFileSync(hermesc, ["-emit-binary", "-O", "-w", "-out", hbc, bundle], { stdio: "inherit" });
  const kb = (f) => `${Math.round(statSync(f).size / 1024)} KB`;
  console.log(`${platform}: bundle ${kb(bundle)}, Hermes bytecode ${kb(hbc)}`);
}

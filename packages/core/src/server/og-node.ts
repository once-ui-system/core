import type * as Dns from "node:dns";
import type * as Http from "node:http";
import type * as Https from "node:https";
import type * as Zlib from "node:zlib";

/**
 * The Node.js built-ins the OG handlers need, loaded at call time.
 *
 * They are deliberately not imported at the top of any module. The handlers
 * are reachable from `@once-ui-system/core/next`, which apps also import from
 * client components (for `LayoutProvider`), so a static `import "node:dns"`
 * would put Node built-ins in front of every browser bundler that resolves
 * that entry. `process.getBuiltinModule` (Node 20.16+, 22.3+) is invisible to
 * bundlers; older runtimes fall back to a dynamic import that bundlers are
 * told to leave alone.
 */
export interface NodeBuiltins {
  dns: typeof Dns;
  http: typeof Http;
  https: typeof Https;
  zlib: typeof Zlib;
}

type BuiltinName = keyof NodeBuiltins;

const BUILTIN_NAMES: BuiltinName[] = ["dns", "http", "https", "zlib"];

let cached: Promise<NodeBuiltins | null> | undefined;

async function loadBuiltin<K extends BuiltinName>(name: K): Promise<NodeBuiltins[K] | null> {
  const runtime = typeof process === "undefined" ? undefined : process;
  const getBuiltinModule = (runtime as { getBuiltinModule?: (id: string) => unknown } | undefined)
    ?.getBuiltinModule;

  if (typeof getBuiltinModule === "function") {
    try {
      const loaded = getBuiltinModule.call(runtime, `node:${name}`);
      if (loaded) {
        return loaded as NodeBuiltins[K];
      }
    } catch {
      // Fall through to the dynamic import.
    }
  }

  try {
    const specifier = `node:${name}`;
    const loaded = await import(/* webpackIgnore: true */ /* @vite-ignore */ specifier);
    return ((loaded as { default?: unknown }).default ?? loaded) as NodeBuiltins[K];
  } catch {
    return null;
  }
}

async function loadAll(): Promise<NodeBuiltins | null> {
  const modules = await Promise.all(BUILTIN_NAMES.map((name) => loadBuiltin(name)));
  if (modules.some((module) => !module)) {
    return null;
  }
  return Object.fromEntries(
    BUILTIN_NAMES.map((name, index) => [name, modules[index]]),
  ) as unknown as NodeBuiltins;
}

/**
 * Resolves to the built-ins, or `null` when the runtime is not Node.js (the
 * Edge runtime, a browser).
 */
export function loadNodeBuiltins(): Promise<NodeBuiltins | null> {
  if (!cached) {
    cached = loadAll();
  }
  return cached;
}

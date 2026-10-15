import { mkdirSync, mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { blockId, type RegistryItem, resolveBlocks } from "../src/commands/add.js";
import { CliError } from "../src/lib/api.js";
import { apiBase, clearToken, configPath, getToken, saveToken } from "../src/lib/config.js";
import {
  detectPackageManager,
  installArgs,
  missingDependencies,
} from "../src/lib/package-manager.js";
import { packageNameFrom, resolveTarget } from "../src/lib/paths.js";

const tmp = () => mkdtempSync(join(tmpdir(), "once-ui-cli-"));

describe("resolveTarget", () => {
  it("writes registry targets as given in a project without src/", () => {
    const dir = tmp();
    expect(resolveTarget(dir, "components/once-ui/pro/Hero1.tsx")).toBe(
      join(dir, "components/once-ui/pro/Hero1.tsx"),
    );
  });

  it("puts them under src/ when the project has one", () => {
    const dir = tmp();
    mkdirSync(join(dir, "src"));
    expect(resolveTarget(dir, "components/once-ui/pro/Hero1.tsx")).toBe(
      join(dir, "src/components/once-ui/pro/Hero1.tsx"),
    );
    expect(resolveTarget(dir, "src/lib/x.ts")).toBe(join(dir, "src/lib/x.ts"));
  });

  it("refuses paths that leave the project", () => {
    const dir = tmp();
    for (const target of ["../evil.ts", "components/../../evil.ts", "/etc/passwd"]) {
      expect(() => resolveTarget(dir, target), target).toThrow(CliError);
    }
  });
});

describe("packageNameFrom", () => {
  it("makes an npm-safe name from a directory", () => {
    expect(packageNameFrom("./My Cool App/")).toBe("my-cool-app");
    expect(packageNameFrom("/tmp/x/landing_site")).toBe("landing-site");
    expect(packageNameFrom("...")).toBe("once-ui-app");
  });
});

describe("package manager", () => {
  it("reads the lockfile and defaults to npm", () => {
    const dir = tmp();
    expect(detectPackageManager(dir)).toBe("npm");
    writeFileSync(join(dir, "pnpm-lock.yaml"), "");
    expect(detectPackageManager(dir)).toBe("pnpm");
  });

  it("uses each manager's own install verb", () => {
    expect(installArgs("npm", ["a"])).toEqual(["install", "a"]);
    expect(installArgs("pnpm", ["a"])).toEqual(["add", "a"]);
  });

  it("only installs what package.json does not already list", async () => {
    const dir = tmp();
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ dependencies: { react: "19" }, devDependencies: { typescript: "6" } }),
    );
    expect(await missingDependencies(dir, ["react", "recharts", "typescript", "recharts"])).toEqual(
      ["recharts"],
    );
  });
});

describe("config", () => {
  it("stores the token readable by the owner only, and clears it", async () => {
    const env = { XDG_CONFIG_HOME: tmp() };
    expect(await getToken(env)).toBeNull();
    await saveToken("oui_abc", env);
    expect(await getToken(env)).toBe("oui_abc");
    // Windows has no POSIX permission bits: Node reports any writable file as 0o666
    // and chmod only toggles read-only, so the owner-only check applies elsewhere.
    if (process.platform !== "win32") {
      expect(statSync(configPath(env)).mode & 0o777).toBe(0o600);
    }
    await clearToken(env);
    expect(await getToken(env)).toBeNull();
  });

  it("lets ONCE_UI_TOKEN win over the stored token", async () => {
    const env = { XDG_CONFIG_HOME: tmp(), ONCE_UI_TOKEN: "oui_env" };
    await saveToken("oui_file", env);
    expect(await getToken(env)).toBe("oui_env");
  });

  it("trims trailing slashes from the API base", () => {
    expect(apiBase("http://localhost:3000/", {})).toBe("http://localhost:3000");
    expect(apiBase(undefined, { ONCE_UI_API: "https://preview.example" })).toBe(
      "https://preview.example",
    );
    expect(apiBase(undefined, {})).toBe("https://once-ui.com");
  });
});

describe("resolveBlocks", () => {
  it("follows registry dependencies and fetches each block once", async () => {
    const registry: Record<string, RegistryItem> = {
      chat1: {
        name: "chat1",
        registryDependencies: ["@once-ui/feed3", "@once-ui/sidebar4"],
        files: [],
      },
      feed3: { name: "feed3", registryDependencies: ["@once-ui/sidebar4"], files: [] },
      sidebar4: { name: "sidebar4", files: [] },
    };
    const fetched: string[] = [];
    const items = await resolveBlocks(["@once-ui/Chat1", "feed3"], async (id) => {
      fetched.push(id);
      return registry[id];
    });
    expect(items.map((i) => i.name)).toEqual(["chat1", "feed3", "sidebar4"]);
    expect(fetched).toEqual(["chat1", "feed3", "sidebar4"]);
  });

  it("normalizes block names", () => {
    expect(blockId("@once-ui/Hero1")).toBe("hero1");
  });
});

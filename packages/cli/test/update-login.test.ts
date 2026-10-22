import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { add, type RegistryItem } from "../src/commands/add.js";
import { login, loginUrl, logout, newLoginRequest } from "../src/commands/login.js";
import { update } from "../src/commands/update.js";
import { createClient } from "../src/lib/api.js";
import { getToken } from "../src/lib/config.js";
import { hashContent, LOCK_FILE, readLock } from "../src/lib/lock.js";

const tmp = () => mkdtempSync(join(tmpdir(), "once-ui-cli-"));
const TOKEN = "oui_test";
const PRO = "components/once-ui/pro";

/** The registry as the fake server serves it; tests change it to publish a "new version". */
let registry: Record<string, RegistryItem>;
/** Hashes of tokens the fake server has "approved", as /api/cli/authorize would store them. */
const approved = new Set<string>();
const revoked: string[] = [];

const item = (name: string, files: Record<string, string>, deps: string[] = []): RegistryItem => ({
  name,
  registryDependencies: deps.map((d) => `@once-ui/${d}`),
  files: Object.entries(files).map(([file, content]) => ({
    path: `${PRO}/${file}`,
    target: `${PRO}/${file}`,
    content,
  })),
});

let server: Server;
let base: string;
const output: string[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    const json = (status: number, payload: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(payload));
    };
    const bearer = req.headers.authorization?.replace("Bearer ", "") ?? "";
    const known = bearer === TOKEN || approved.has(hashContent(bearer));

    if (req.url === "/images/a.png") {
      res.writeHead(200, { "content-type": "image/png" });
      return res.end("png");
    }
    if (req.url === "/api/cli/whoami") {
      if (!known) return json(401, { error: "Not signed in." });
      return json(200, {
        email: "you@example.com",
        blocks: true,
        tier: "pro",
        stack: "subscription",
      });
    }
    if (req.url === "/api/cli/token" && req.method === "DELETE") {
      revoked.push(bearer);
      return json(known ? 200 : 401, {});
    }
    const block = req.url?.match(/^\/api\/registry\/([a-z0-9-]+)$/)?.[1];
    if (block) {
      if (!known) return json(401, { error: "Unauthorized." });
      return registry[block] ? json(200, registry[block]) : json(404, { error: "Block not found" });
    }
    json(404, { error: "not found" });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  vi.spyOn(console, "log").mockImplementation((...args) => {
    output.push(args.join(" "));
  });
});

afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

beforeEach(() => {
  output.length = 0;
  registry = {
    chat1: item("chat1", { "Chat1.tsx": "chat v1", "chat1content.ts": "data v1" }, ["sidebar4"]),
    sidebar4: item("sidebar4", { "Sidebar4.tsx": "sidebar v1", "chat1content.ts": "data v1" }),
    mine: item("mine", { "Mine.tsx": "not a block on disk" }),
  };
});

const client = () => createClient(base, TOKEN);
const read = (dir: string, file: string) => readFileSync(join(dir, PRO, file), "utf8");

describe("add", () => {
  it("writes a file two blocks share once, and records every file in the lock", async () => {
    const dir = tmp();
    await add(client(), ["chat1"], { cwd: dir, install: false });
    expect(read(dir, "chat1content.ts")).toBe("data v1");
    expect(output.filter((l) => l.includes("chat1content.ts"))).toHaveLength(1);
    const lock = await readLock(dir);
    expect(Object.keys(lock.blocks).sort()).toEqual(["chat1", "sidebar4"]);
    expect(lock.blocks.sidebar4.files[`${PRO}/chat1content.ts`]).toBe(hashContent("data v1"));
  });
});

describe("media", () => {
  it("downloads the images a block shows into public/, keeping files already there", async () => {
    const dir = tmp();
    registry.pic = {
      ...item("pic", { "Pic.tsx": "pic" }),
      meta: { assets: ["/images/a.png", "/images/missing.png", "/../etc/passwd"] },
    };
    await add(client(), ["pic"], { cwd: dir, install: false });
    expect(readFileSync(join(dir, "public/images/a.png"), "utf8")).toBe("png");
    expect(existsSync(join(dir, "public/images/missing.png"))).toBe(false);
    expect(output.join("\n")).toMatch(/1 image\(s\) and video\(s\) into public/);

    writeFileSync(join(dir, "public/images/a.png"), "mine");
    await add(client(), ["pic"], { cwd: dir, install: false });
    expect(readFileSync(join(dir, "public/images/a.png"), "utf8")).toBe("mine");
  });
});

describe("update", () => {
  it("replaces untouched files, keeps edited ones, and adds blocks a new version imports", async () => {
    const dir = tmp();
    await add(client(), ["chat1"], { cwd: dir, install: false });
    writeFileSync(join(dir, PRO, "Sidebar4.tsx"), "my sidebar");

    registry.chat1 = item("chat1", { "Chat1.tsx": "chat v2", "chat1content.ts": "data v2" }, [
      "sidebar4",
      "mine",
    ]);
    registry.sidebar4 = item("sidebar4", {
      "Sidebar4.tsx": "sidebar v2",
      "chat1content.ts": "data v2",
    });
    output.length = 0;
    await update(client(), [], { cwd: dir, install: false });

    expect(read(dir, "Chat1.tsx")).toBe("chat v2");
    expect(read(dir, "chat1content.ts")).toBe("data v2");
    expect(read(dir, "Sidebar4.tsx")).toBe("my sidebar");
    expect(read(dir, "Mine.tsx")).toBe("not a block on disk");
    expect(output.join("\n")).toMatch(/keep\s+components\/once-ui\/pro\/Sidebar4\.tsx \(edited/);
    expect(output.at(-1)).toMatch(/2 updated, 1 added, 1 kept/);

    await update(client(), ["sidebar4"], { cwd: dir, install: false, force: true });
    expect(read(dir, "Sidebar4.tsx")).toBe("sidebar v2");
  });

  it("changes nothing on --dry-run", async () => {
    const dir = tmp();
    await add(client(), ["sidebar4"], { cwd: dir, install: false });
    registry.sidebar4 = item("sidebar4", {
      "Sidebar4.tsx": "sidebar v2",
      "chat1content.ts": "data v1",
    });
    const before = readFileSync(join(dir, LOCK_FILE), "utf8");
    output.length = 0;
    await update(client(), [], { cwd: dir, install: false, dryRun: true });
    expect(read(dir, "Sidebar4.tsx")).toBe("sidebar v1");
    expect(readFileSync(join(dir, LOCK_FILE), "utf8")).toBe(before);
    expect(output.join("\n")).toMatch(/would update components\/once-ui\/pro\/Sidebar4\.tsx/);
  });

  it("says so when everything is current", async () => {
    const dir = tmp();
    await add(client(), ["sidebar4"], { cwd: dir, install: false });
    output.length = 0;
    await update(client(), [], { cwd: dir, install: false });
    expect(output.at(-1)).toMatch(/Everything is up to date/);
  });

  it("finds blocks added before the lock existed, and leaves your own components alone", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "src", PRO), { recursive: true });
    writeFileSync(join(dir, "src", PRO, "Sidebar4.tsx"), "sidebar v0");
    writeFileSync(join(dir, "src", PRO, "MyCard.tsx"), "mine");
    await update(client(), [], { cwd: dir, install: false });
    // No record of what was installed: a differing file is kept, a missing one added.
    expect(readFileSync(join(dir, "src", PRO, "Sidebar4.tsx"), "utf8")).toBe("sidebar v0");
    expect(readFileSync(join(dir, "src", PRO, "chat1content.ts"), "utf8")).toBe("data v1");
    expect(Object.keys((await readLock(dir)).blocks)).toEqual(["sidebar4"]);
    expect(output.join("\n")).toMatch(/no record of the installed version/);
  });

  it("explains an empty project", async () => {
    await expect(update(client(), [], { cwd: tmp(), install: false })).rejects.toThrow(
      /No blocks to update/,
    );
  });
});

describe("login", () => {
  beforeEach(() => {
    process.env.XDG_CONFIG_HOME = tmp();
    delete process.env.ONCE_UI_TOKEN;
  });

  it("builds the approval link and a code from the token's hash", () => {
    const { token, hash, code } = newLoginRequest();
    expect(token).toMatch(/^oui_[0-9a-f]{48}$/);
    expect(hash).toBe(hashContent(token));
    expect(code).toBe(`${hash.slice(0, 4)}-${hash.slice(4, 8)}`.toUpperCase());
    const url = new URL(loginUrl("https://once-ui.com", hash, "my mac", 1800000000));
    expect(url.pathname).toBe("/cli/login");
    expect(url.searchParams.get("h")).toBe(hash);
    expect(url.searchParams.get("n")).toBe("my mac");
    expect(url.searchParams.get("t")).toBe("1800000000");
    expect(url.search).not.toContain("oui_");
  });

  it("waits for the browser approval, then saves the token it made", async () => {
    const stdin = process.stdin.isTTY;
    process.stdin.isTTY = true;
    try {
      const done = login(base, { browser: false, pollMs: 10 });
      await vi.waitFor(() => expect(output.some((l) => l.includes("/cli/login?h="))).toBe(true));
      const link = output.join("\n").match(/http\S+\/cli\/login\?\S+/)?.[0] as string;
      const hash = new URL(link).searchParams.get("h") as string;
      approved.add(hash);
      await done;
      const saved = await getToken();
      expect(saved && hashContent(saved)).toBe(hash);
      expect(output.join("\n")).toMatch(/Signed in as you@example.com/);
    } finally {
      process.stdin.isTTY = stdin;
    }
  });

  it("gives up when the link is never approved", async () => {
    const stdin = process.stdin.isTTY;
    process.stdin.isTTY = true;
    try {
      await expect(login(base, { browser: false, pollMs: 5, timeoutMs: 30 })).rejects.toThrow(
        /expired before it was approved/,
      );
      expect(await getToken()).toBeNull();
    } finally {
      process.stdin.isTTY = stdin;
    }
  });

  it("still takes a token directly, and checks it first", async () => {
    await expect(login(base, { token: "oui_wrong" })).rejects.toThrow(/did not accept/);
    await login(base, { token: TOKEN });
    expect(await getToken()).toBe(TOKEN);
  });

  it("revokes the token on logout", async () => {
    await login(base, { token: TOKEN });
    await logout(base);
    expect(revoked.at(-1)).toBe(TOKEN);
    expect(await getToken()).toBeNull();
    expect(existsSync(join(process.env.XDG_CONFIG_HOME as string, "once-ui"))).toBe(true);
  });
});

describe("block icons and dependencies", () => {
  it("installs packages, not the import paths an older registry listed", async () => {
    const { packageOf } = await import("../src/commands/add.js");
    expect(packageOf("@once-ui-system/core/code")).toBe("@once-ui-system/core");
    expect(packageOf("next/image")).toBe("next");
    expect(packageOf("react-globe.gl")).toBe("react-globe.gl");
    expect(packageOf("@/utils/dev-logger")).toBeNull();
    expect(packageOf("../x")).toBeNull();
  });

  it("registers the block icons in an IconProvider wired the usual way, once", async () => {
    const { registerBlockIcons } = await import("../src/lib/icons.js");
    const dir = tmp();
    mkdirSync(join(dir, "src/components/once-ui/pro"), { recursive: true });
    const icons = join(dir, "src/components/once-ui/pro/blockIcons.ts");
    writeFileSync(icons, "export const blockIcons = {};");
    const providers = join(dir, "src/components/Providers.tsx");
    writeFileSync(
      providers,
      `import { IconProvider } from "@once-ui-system/core";\nimport { iconLibrary } from "../resources/icons";\n\nexport const P = () => <IconProvider icons={iconLibrary}>x</IconProvider>;\n`,
    );
    expect((await registerBlockIcons(dir, icons)).status).toBe("patched");
    const patched = readFileSync(providers, "utf8");
    expect(patched).toContain('import { blockIcons } from "./once-ui/pro/blockIcons";');
    expect(patched).toContain("icons={{ ...iconLibrary, ...blockIcons }}");
    expect((await registerBlockIcons(dir, icons)).status).toBe("already");
  });

  it("leaves an IconProvider it doesn't recognise alone", async () => {
    const { registerBlockIcons } = await import("../src/lib/icons.js");
    const dir = tmp();
    const icons = join(dir, "blockIcons.ts");
    writeFileSync(icons, "");
    writeFileSync(join(dir, "Providers.tsx"), "<IconProvider icons={{ ...a, ...b }}>");
    expect((await registerBlockIcons(dir, icons)).status).toBe("manual");
  });
});

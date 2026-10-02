import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { c as createTar } from "tar";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { add } from "../src/commands/add.js";
import { create } from "../src/commands/create.js";
import { CliError, createClient } from "../src/lib/api.js";

const tmp = () => mkdtempSync(join(tmpdir(), "once-ui-cli-"));
const TOKEN = "oui_test";

/** A tarball like the scaffold API returns: entries at the archive root. */
async function appTarball(): Promise<Buffer> {
  const dir = tmp();
  mkdirSync(join(dir, "src/app"), { recursive: true });
  writeFileSync(join(dir, "package.json"), '{"name":"my-app"}');
  writeFileSync(join(dir, "src/app/page.tsx"), "export default function Page() {}");
  const chunks: Buffer[] = [];
  for await (const chunk of createTar({ gzip: true, cwd: dir, portable: true }, [
    "package.json",
    "src",
  ])) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

const body = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

let server: Server;
let base: string;
const requests: { path: string; body?: unknown; auth?: string }[] = [];

beforeAll(async () => {
  const tarball = await appTarball();
  server = createServer(async (req, res) => {
    const auth = req.headers.authorization;
    const json = (status: number, payload: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(payload));
    };

    if (req.url === "/api/stack/scaffold" && req.method === "POST") {
      const payload = await body(req);
      requests.push({ path: req.url, body: payload, auth });
      if (payload.surfaces.includes("dashboard") && auth !== `Bearer ${TOKEN}`) {
        return json(401, { error: "Sign in to scaffold dashboard." });
      }
      res.writeHead(200, { "content-type": "application/gzip", "x-stack-release": "abc1234def" });
      return res.end(tarball);
    }

    const block = req.url?.match(/^\/api\/registry\/([a-z0-9-]+)$/)?.[1];
    if (block) {
      requests.push({ path: req.url as string, auth });
      const items: Record<string, unknown> = {
        hero1: {
          name: "hero1",
          dependencies: ["@once-ui-system/core", "recharts"],
          registryDependencies: ["@once-ui/badge1"],
          files: [{ path: "x", target: "components/once-ui/pro/Hero1.tsx", content: "hero" }],
        },
        badge1: {
          name: "badge1",
          files: [{ path: "x", target: "components/once-ui/pro/Badge1.tsx", content: "badge" }],
        },
        evil: { name: "evil", files: [{ path: "x", target: "../../evil.ts", content: "!" }] },
      };
      return items[block] ? json(200, items[block]) : json(404, { error: "Block not found" });
    }

    json(404, { error: "not found" });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

describe("create", () => {
  it("unpacks the scaffolded app into a new directory and sends the derived name", async () => {
    const dir = join(tmp(), "My Site");
    await create(createClient(base, null), dir, { surfaces: "docs" });
    expect(readFileSync(join(dir, "package.json"), "utf8")).toContain("my-app");
    expect(existsSync(join(dir, "src/app/page.tsx"))).toBe(true);
    expect(requests.at(-1)?.body).toEqual({ surfaces: ["docs"], slices: [], name: "my-site" });
  });

  it("passes the token and surfaces the server's refusal", async () => {
    const dir = join(tmp(), "app");
    await expect(
      create(createClient(base, null), dir, { surfaces: "landing,dashboard" }),
    ).rejects.toThrow(/Sign in to scaffold dashboard[\s\S]*once-ui login/);
    expect(existsSync(dir)).toBe(false);
    await create(createClient(base, TOKEN), dir, {
      surfaces: "landing,dashboard",
      slices: "billing",
    });
    expect(requests.at(-1)?.auth).toBe(`Bearer ${TOKEN}`);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  });

  it("will not unpack into a directory that has files in it", async () => {
    const dir = tmp();
    writeFileSync(join(dir, "keep.txt"), "mine");
    await expect(create(createClient(base, null), dir, { surfaces: "docs" })).rejects.toThrow(
      CliError,
    );
  });
});

describe("add", () => {
  it("writes a block and the blocks it imports under src/, skipping existing files", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "src"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ dependencies: { "@once-ui-system/core": "2" } }),
    );
    await add(createClient(base, TOKEN), ["@once-ui/hero1"], { cwd: dir, install: false });
    expect(readFileSync(join(dir, "src/components/once-ui/pro/Hero1.tsx"), "utf8")).toBe("hero");
    expect(readFileSync(join(dir, "src/components/once-ui/pro/Badge1.tsx"), "utf8")).toBe("badge");

    writeFileSync(join(dir, "src/components/once-ui/pro/Hero1.tsx"), "edited");
    await add(createClient(base, TOKEN), ["hero1"], { cwd: dir, install: false });
    expect(readFileSync(join(dir, "src/components/once-ui/pro/Hero1.tsx"), "utf8")).toBe("edited");
    await add(createClient(base, TOKEN), ["hero1"], { cwd: dir, install: false, overwrite: true });
    expect(readFileSync(join(dir, "src/components/once-ui/pro/Hero1.tsx"), "utf8")).toBe("hero");
  });

  it("refuses a registry file that points outside the project", async () => {
    const dir = tmp();
    await expect(
      add(createClient(base, TOKEN), ["evil"], { cwd: dir, install: false }),
    ).rejects.toThrow(/outside the project/);
  });

  it("names a block that does not exist", async () => {
    await expect(
      add(createClient(base, TOKEN), ["nope1"], { cwd: tmp(), install: false }),
    ).rejects.toThrow('No block named "nope1".');
  });
});

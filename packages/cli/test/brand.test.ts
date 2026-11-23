import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { c as createTar } from "tar";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { brand } from "../src/commands/brand.js";
import { create } from "../src/commands/create.js";
import { createClient } from "../src/lib/api.js";
import { applyBrand, brandConfig, type PulledBrand } from "../src/lib/brand.js";

const tmp = () => mkdtempSync(join(tmpdir(), "once-ui-brand-"));
const ID = "11111111-2222-3333-4444-555555555555";
const GEN = "99999999-8888-7777-6666-555555555555";

const CONFIG = `import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
});

const style = {
  theme: "dark",
  brand: "blue", // blue | indigo
  accent: "yellow",
};

const schema = {
  logo: "",
  name: "Once UI",
};

export { style, schema };
`;

const pulled: PulledBrand = {
  id: ID,
  name: "Fjell",
  tagline: "Maps for hikers",
  brand: "#1f9d6b",
  scheme: "emerald",
  font: "Space Grotesk",
  icon: "brand",
  config: {
    name: "Fjell",
    style: { brand: "custom", brandSeed: "#1f9d6b" },
    fonts: { heading: "Space Grotesk" },
  },
  files: [
    { path: "public/trademarks/icon-light.svg", text: "<svg>fjell</svg>" },
    { path: "src/app/favicon.ico", base64: Buffer.from([0, 0, 1, 0]).toString("base64") },
  ],
  agentsNote: "## Brand\n\nFjell.",
};

async function appTarball(): Promise<Buffer> {
  const dir = tmp();
  mkdirSync(join(dir, "src/resources"), { recursive: true });
  writeFileSync(join(dir, "package.json"), '{"name":"my-app"}');
  writeFileSync(join(dir, "src/resources/once-ui.config.js"), CONFIG);
  const chunks: Buffer[] = [];
  for await (const chunk of createTar({ gzip: true, cwd: dir, portable: true }, [
    "package.json",
    "src",
  ]))
    chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const read = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

let server: Server;
let base: string;
const calls: { path: string; body?: unknown }[] = [];

beforeAll(async () => {
  const tarball = await appTarball();
  server = createServer(async (req, res) => {
    const json = (status: number, payload: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(payload));
    };
    const path = req.url ?? "";
    const body = req.method === "POST" ? await read(req) : undefined;
    calls.push({ path, body });
    if (path === "/api/stack/scaffold") {
      res.writeHead(200, { "content-type": "application/gzip" });
      return res.end(tarball);
    }
    if (path === "/api/brand-kit/v1/generate")
      return json(200, {
        generationId: GEN,
        name: "Fjell",
        tagline: "Maps for hikers",
        brand: "#1f9d6b",
        font: "Space Grotesk",
        candidates: [0, 1, 2, 3].map((pick) => ({ pick, mark: "<svg/>", wordmark: null })),
        boardUrl: `https://once-ui.com/brand-kit?generation=${GEN}`,
      });
    if (path === "/api/brand-kit/v1/brands" && req.method === "POST")
      return json(200, { ...pulled, files: undefined });
    if (path === "/api/brand-kit/v1/brands") return json(200, { brands: [pulled] });
    if (path === `/api/brand-kit/v1/brands/${ID}`) return json(200, pulled);
    json(404, { error: "Not found." });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

describe("brandConfig", () => {
  it("sets the exact colour, the heading font and the name", () => {
    const out = brandConfig(CONFIG, pulled.config);
    expect(out).toContain('brand: "custom", // blue | indigo');
    expect(out).toContain('brandSeed: "#1f9d6b",');
    expect(out).toContain('import { Space_Grotesk } from "next/font/google";');
    expect(out).toContain("const heading = Space_Grotesk(");
    expect(out).toContain('name: "Fjell",');
    expect(out).toContain('accent: "yellow"');
    // A second pull replaces the seed instead of adding another.
    const again = brandConfig(out, {
      ...pulled.config,
      style: { brand: "custom", brandSeed: "#ff0000" },
    });
    expect(again.match(/brandSeed/g)).toHaveLength(1);
    expect(again).toContain('brandSeed: "#ff0000"');
    expect(again.match(/import \{ Space_Grotesk \}/g)).toHaveLength(1);
  });

  it("leaves a config without the anchors as it is", () => {
    expect(brandConfig("export const x = 1;\n", pulled.config)).toBe("export const x = 1;\n");
  });
});

describe("applyBrand", () => {
  it("writes the files, text and binary, and the config and AGENTS note", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "src/resources"), { recursive: true });
    writeFileSync(join(dir, "src/resources/once-ui.config.js"), CONFIG);
    writeFileSync(join(dir, "AGENTS.md"), "# App\n");
    const { written } = await applyBrand(dir, pulled);
    expect(readFileSync(join(dir, "public/trademarks/icon-light.svg"), "utf8")).toBe(
      "<svg>fjell</svg>",
    );
    expect([...readFileSync(join(dir, "src/app/favicon.ico"))]).toEqual([0, 0, 1, 0]);
    expect(readFileSync(join(dir, "AGENTS.md"), "utf8")).toContain("## Brand");
    expect(written).toContain("src/resources/once-ui.config.js");
  });

  it("refuses a path outside the app", async () => {
    await expect(
      applyBrand(tmp(), { ...pulled, files: [{ path: "../evil.txt", text: "!" }] }),
    ).rejects.toThrow(/outside/);
  });
});

describe("once-ui brand", () => {
  it("lists saved brands", async () => {
    await brand(createClient(base, "oui_t"), ["list"], {});
    expect(calls.at(-1)?.path).toBe("/api/brand-kit/v1/brands");
  });

  it("pulls a saved brand into an app", async () => {
    const dir = tmp();
    mkdirSync(join(dir, "src/resources"), { recursive: true });
    writeFileSync(join(dir, "src/resources/once-ui.config.js"), CONFIG);
    await brand(createClient(base, "oui_t"), ["pull", ID, dir], {});
    expect(existsSync(join(dir, "public/trademarks/icon-light.svg"))).toBe(true);
  });

  it("refuses to pull into a folder without once-ui.config", async () => {
    await expect(brand(createClient(base, "oui_t"), ["pull", ID, tmp()], {})).rejects.toThrow(
      /no once-ui.config/,
    );
  });
});

describe("create --brand", () => {
  it("generates, keeps the picked candidate, scaffolds, then writes the brand", async () => {
    const dir = join(tmp(), "fjell");
    calls.length = 0;
    await create(createClient(base, "oui_t"), dir, {
      surfaces: "landing",
      brand: "Fjell, maps for hikers",
      pick: "2",
    });
    expect(calls.map((c) => c.path)).toEqual([
      "/api/brand-kit/v1/generate",
      "/api/brand-kit/v1/brands",
      "/api/stack/scaffold",
      `/api/brand-kit/v1/brands/${ID}`,
    ]);
    expect(calls[1].body).toEqual({ generationId: GEN, pick: 2 });
    expect(readFileSync(join(dir, "src/resources/once-ui.config.js"), "utf8")).toContain(
      'brandSeed: "#1f9d6b"',
    );
  });

  it("uses a saved brand by id without generating", async () => {
    const dir = join(tmp(), "saved");
    calls.length = 0;
    await create(createClient(base, "oui_t"), dir, { surfaces: "landing", brand: ID });
    expect(calls.map((c) => c.path)).toEqual([
      "/api/stack/scaffold",
      `/api/brand-kit/v1/brands/${ID}`,
    ]);
  });
});

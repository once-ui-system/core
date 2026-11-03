import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { download, majorOf, migrate, newestRelease } from "../src/commands/migrate.js";
import { CliError } from "../src/lib/api.js";

const tmp = () => mkdtempSync(join(tmpdir(), "once-ui-cli-"));

/**
 * A codemod split across modules like the real one: it writes what it was
 * given into the project, only when run directly, so the test sees the args.
 */
const SCRIPTS: Record<string, string> = {
  "codemod-3.0.mjs": `import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NAME } from "./codemod-3.0-format.mjs";
if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [dir, ...flags] = process.argv.slice(2);
  if (fs.existsSync(path.join(dir, "stop"))) process.exit(3);
  fs.writeFileSync(path.join(dir, "ran.json"), JSON.stringify({ NAME, flags }));
}`,
  "codemod-3.0-format.mjs": `import { X } from "./codemod-3.0-scan.mjs";\nexport const NAME = "format" + X;`,
  "codemod-3.0-scan.mjs": `export const X = "+scan";`,
};

let server: Server;
let base: string;
let tags: Record<string, string>;
const fetched: string[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = req.url ?? "";
    fetched.push(url);
    if (url === "/registry/@once-ui-system/core") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ "dist-tags": tags }));
    }
    const match = /^\/source\/v([^/]+)\/scripts\/(.+)$/.exec(url);
    if (match && match[1] === tags.next && SCRIPTS[match[2]]) {
      res.writeHead(200);
      return res.end(SCRIPTS[match[2]]);
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

const flags = (extra = {}) => ({
  registry: `${base}/registry`,
  source: `${base}/source`,
  ...extra,
});

describe("migrate", () => {
  it("reads a major from the ways people write it", () => {
    expect(majorOf("3.0")).toBe(3);
    expect(majorOf("v3")).toBe(3);
    expect(majorOf("3.0.0")).toBe(3);
    expect(() => majorOf(undefined)).toThrow(CliError);
    expect(() => majorOf("latest")).toThrow(CliError);
  });

  it("picks the newest release of the major, latest before next", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    expect(await newestRelease(`${base}/registry`, 3)).toBe("3.0.0-beta.1");
    expect(await newestRelease(`${base}/registry`, 2)).toBe("2.6.0");
    tags = { latest: "3.0.0", next: "3.0.0-beta.1" };
    expect(await newestRelease(`${base}/registry`, 3)).toBe("3.0.0");
    await expect(newestRelease(`${base}/registry`, 4)).rejects.toThrow("isn't published yet");
  });

  it("downloads the codemod and every module it imports", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    const into = tmp();
    const files = await download(`${base}/source/v3.0.0-beta.1/scripts`, "codemod-3.0.mjs", into);
    expect(files.sort()).toEqual(Object.keys(SCRIPTS).sort());
    expect(readdirSync(into).sort()).toEqual(Object.keys(SCRIPTS).sort());
  });

  it("runs the codemod at the release's tag over the project, with its flags", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    const cwd = tmp();
    fetched.length = 0;
    await migrate("3.0", undefined, flags({ cwd, dryRun: true, force: true }));
    const ran = JSON.parse(readFileSync(join(cwd, "ran.json"), "utf8"));
    expect(ran).toEqual({ NAME: "format+scan", flags: ["--dry", "--force"] });
    expect(fetched).toContain("/source/v3.0.0-beta.1/scripts/codemod-3.0.mjs");
  });

  it("leaves out flags the codemod doesn't take", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    const cwd = tmp();
    await migrate("3", ".", flags({ cwd, css: true }));
    expect(JSON.parse(readFileSync(join(cwd, "ran.json"), "utf8")).flags).toEqual([]);
  });

  it("names the install that comes next", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    const cwd = tmp();
    writeFileSync(join(cwd, "pnpm-lock.yaml"), "");
    const log = vi.mocked(console.log);
    log.mockClear();
    await migrate("3.0", undefined, flags({ cwd }));
    expect(log.mock.calls.flat().join("\n")).toContain(
      "pnpm add @once-ui-system/core@3.0.0-beta.1",
    );
  });

  it("refuses a major with no codemod and a folder that isn't there", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    await expect(migrate("1.0", undefined, flags({ cwd: tmp() }))).rejects.toThrow("no migration");
    await expect(migrate("3.0", "missing", flags({ cwd: tmp() }))).rejects.toThrow(
      "is not a folder",
    );
  });

  it("fails when the codemod stops", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    const cwd = tmp();
    writeFileSync(join(cwd, "stop"), "");
    await expect(migrate("3.0", undefined, flags({ cwd }))).rejects.toThrow("exit code 3");
  });

  it("fails when the codemod can't be downloaded, and cleans up after itself", async () => {
    tags = { latest: "2.6.0", next: "3.0.0-beta.1" };
    const cwd = tmp();
    await expect(
      migrate("3.0", undefined, flags({ cwd, source: `${base}/nowhere` })),
    ).rejects.toThrow("Couldn't download");
    expect(existsSync(join(cwd, "ran.json"))).toBe(false);
  });
});

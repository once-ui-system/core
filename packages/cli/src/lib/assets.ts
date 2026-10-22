import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ApiClient } from "./api.js";

/**
 * Download the images and videos blocks show into the project's `public/`,
 * from the same paths on the server (`/images/avatars/01.png`). Files already
 * there are kept: they may be your own. Returns what was written.
 */
export async function downloadAssets(client: ApiClient, cwd: string, assets: string[]) {
  // Paths come from the server: only plain root-relative ones, never climbing out of public/.
  const wanted = [...new Set(assets)].filter(
    (asset) => /^\/[\w\-/.]+$/.test(asset) && !asset.split("/").includes(".."),
  );
  const missing = wanted.filter((asset) => !existsSync(join(cwd, "public", asset)));
  const written: string[] = [];
  const failed: string[] = [];
  const queue = [...missing];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const asset = queue.shift() as string;
        try {
          const res = await fetch(`${client.base}${asset}`, {
            headers: { "user-agent": "once-ui-cli" },
          });
          if (!res.ok) throw new Error(String(res.status));
          const path = join(cwd, "public", asset);
          await mkdir(dirname(path), { recursive: true });
          await writeFile(path, Buffer.from(await res.arrayBuffer()));
          written.push(asset);
        } catch {
          failed.push(asset);
        }
      }
    }),
  );
  return { written, failed };
}

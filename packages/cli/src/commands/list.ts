import { type ApiClient, getCatalog } from "../lib/api.js";

/** Print the current Stack release's surfaces and slices, marking the ones you own. */
export async function list(client: ApiClient) {
  const catalog = await getCatalog(client);
  const width = Math.max(...[...catalog.surfaces, ...catalog.slices].map((e) => e.id.length));
  const row = (e: { id: string; title: string; requires: string[]; owned: boolean }) =>
    `  ${e.owned ? "✓" : " "} ${e.id.padEnd(width)}  ${e.title}${
      e.requires.length ? `  (needs ${e.requires.join(", ")})` : ""
    }`;

  console.log(`Stack release ${catalog.release.slice(0, 7)}`);
  console.log(catalog.signedIn ? `Access: ${catalog.access}` : "Not signed in — `once-ui login`");
  console.log("\nSurfaces");
  for (const s of catalog.surfaces) console.log(row(s));
  console.log("\nSlices (come with the surfaces that need them, or ask for one with --slices)");
  for (const s of catalog.slices) console.log(row(s));
}

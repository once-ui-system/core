#!/usr/bin/env node
// Blinded rater for the full run (METHODOLOGY.md §4.5): one API call per packet,
// images only (+ the task text), arm labels never sent.
//
//   node runner/blind.mjs --results results/full-rc0          # build packets, seal the key
//   ANTHROPIC_API_KEY=… node runner/rate-api.mjs --results results/full-rc0
//   node runner/blind.mjs --results results/full-rc0 --unseal
//
// Writes work/ratings-raw-<name>.json; resumable (rated IDs are skipped).

import fs from "node:fs";
import path from "node:path";
import { WORK, config, createClient } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const resultsDir = path.resolve(arg("results", "results/full-rc0"));
const name = path.basename(resultsDir);
const outPath = path.join(WORK, `ratings-raw-${name}.json`);
const blindDir = path.join(resultsDir, "blind");
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set.");
  process.exit(2);
}
const client = createClient();
const done = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : [];
const IMAGES = ["phone", "tablet", "desktop", "phone-interaction", "desktop-interaction"];

for (const id of fs.readdirSync(blindDir).sort()) {
  if (done.some((r) => r.id === id)) continue;
  const dir = path.join(blindDir, id);
  const content = [];
  for (const img of IMAGES) {
    const f = path.join(dir, `${img}.jpg`);
    if (!fs.existsSync(f)) continue;
    content.push({ type: "text", text: `${img}:` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: fs.readFileSync(f).toString("base64") } });
  }
  content.push({ type: "text", text: fs.readFileSync(path.join(dir, "prompt.md"), "utf8") });
  const res = await client.messages.create({
    model: config.rater.model,
    max_tokens: 1000,
    thinking: config.rater.thinking,
    output_config: { effort: config.rater.effort },
    messages: [{ role: "user", content }],
  });
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  done.push({ ...json, id, usage: res.usage });
  fs.writeFileSync(outPath, JSON.stringify(done, null, 2));
  console.log(`${id} polish=${json.polish} completeness=${json.completeness} responsiveness=${json.responsiveness} restraint=${json.restraint}`);
}

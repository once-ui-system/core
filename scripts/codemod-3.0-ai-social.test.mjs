import assert from "node:assert/strict";
import { test } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const run = (src) => transform(src, { file: "app/page.tsx" }).out;

test("2.4 loaders and ai/social components take aria-label and tone", () => {
  const out = run(
    'import { LogoSpinner, VoiceVisualizer, Reactions } from "@once-ui-system/core";\n' +
      'export const A = () => (<>\n  <LogoSpinner color="accent" ariaLabel="Loading chat" />\n' +
      '  <VoiceVisualizer color="neutral" ariaLabel="Listening" />\n  <Reactions ariaLabel="Reactions" />\n</>);\n',
  );
  assert.match(out, /<LogoSpinner tone="accent" aria-label="Loading chat" \/>/);
  assert.match(out, /<VoiceVisualizer tone="neutral" aria-label="Listening" \/>/);
  assert.match(out, /<Reactions aria-label="Reactions" \/>/);
});

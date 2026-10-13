const fs = require("fs");
const path = require("path");

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDir(srcPath, destPath);
    } else {
      // Copy file if it's not a TypeScript file (TS files are handled by tsc)
      const ext = path.extname(entry.name).toLowerCase();
      if (![".ts", ".tsx"].includes(ext)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Copy all style files and other assets
const srcDir = path.resolve(__dirname, "../src");
const destDir = path.resolve(__dirname, "../dist");

// No `dist/package.json`. The package is published from its root, whose
// package.json `files` includes `dist`; a second manifest inside `dist` was a
// leftover from publishing the folder itself. It shipped in the tarball with
// stale peers (`next >=13`, no sass/recharts/prismjs/compressorjs) and an
// `exports` map that only resolves from the root, and because bundlers and
// Node read the nearest package.json for a module, it hid the root's
// `sideEffects` (and would hide a future `type`) from every file under `dist`.
const staleManifest = path.resolve(destDir, "package.json");
if (fs.existsSync(staleManifest)) fs.rmSync(staleManifest);

// Copy README and AGENTS.md
if (fs.existsSync(path.resolve(__dirname, "../README.md"))) {
  fs.copyFileSync(path.resolve(__dirname, "../README.md"), path.resolve(destDir, "README.md"));
}
if (fs.existsSync(path.resolve(__dirname, "../AGENTS.md"))) {
  fs.copyFileSync(path.resolve(__dirname, "../AGENTS.md"), path.resolve(destDir, "AGENTS.md"));
}

// Copy CLI scripts and agent templates for npm publish
const scriptsDir = path.resolve(destDir, "scripts");
fs.mkdirSync(scriptsDir, { recursive: true });
for (const script of ["init-agent.js", "validate-ai-code.js"]) {
  fs.copyFileSync(path.resolve(__dirname, script), path.join(scriptsDir, script));
}
const agentSrc = path.resolve(__dirname, "../agent");
const agentDest = path.resolve(destDir, "agent");
if (fs.existsSync(agentSrc)) {
  copyDir(agentSrc, agentDest);
}

// Copy style files
console.log("Copying style files and other assets...");
copyDir(srcDir, destDir);

// Copy AI harness artifacts for npm publish
const aiDir = path.resolve(__dirname, "../ai");
const aiDest = path.resolve(destDir, "ai");
if (fs.existsSync(aiDir)) {
  console.log("Copying AI artifacts...");
  copyDir(aiDir, aiDest);
}

console.log("Files copied successfully!");

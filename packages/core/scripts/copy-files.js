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

// Copy package.json with modifications
const packageJson = require("../package.json");

// Remove unnecessary fields for the published package
const fieldsToRemove = ["scripts", "devDependencies", "overrides"];

fieldsToRemove.forEach((field) => {
  delete packageJson[field];
});

// Move some dependencies to peerDependencies
const peerDeps = {
  react: packageJson.dependencies.react,
  "react-dom": packageJson.dependencies["react-dom"],
  next: packageJson.dependencies.next,
};

// Add peer dependencies
packageJson.peerDependencies = {
  ...peerDeps,
  react: ">=18.0.0",
  "react-dom": ">=18.0.0",
  next: ">=13.0.0",
};

// Remove peer deps from dependencies
Object.keys(peerDeps).forEach((dep) => {
  delete packageJson.dependencies[dep];
});

// Write the modified package.json to dist
fs.writeFileSync(path.resolve(destDir, "package.json"), JSON.stringify(packageJson, null, 2));

// Copy README
if (fs.existsSync(path.resolve(__dirname, "../README.md"))) {
  fs.copyFileSync(path.resolve(__dirname, "../README.md"), path.resolve(destDir, "README.md"));
}

// Copy style files
console.log("Copying style files and other assets...");
copyDir(srcDir, destDir);
console.log("Files copied successfully!");

import path from "node:path";
import { fileURLToPath } from "node:url";
import onceUiConfig from "@once-ui-system/core/tailwind.config";
import type { Config } from "tailwindcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Config = {
  presets: [onceUiConfig],
  content: [
    path.join(__dirname, "src/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "../../packages/core/src/**/*.{js,ts,jsx,tsx}"),
    path.join(__dirname, "../../packages/core/ai/**/*.{js,ts,jsx,tsx,mdx,json}"),
  ],
};

export default config;

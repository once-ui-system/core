import { createRoot } from "react-dom/client";
import { App } from "./App";

const theme = new URLSearchParams(location.search).get("theme") === "light" ? "light" : "dark";
const param = new URLSearchParams(location.search).get("screen");
const screen =
  param === "order" ||
  param === "sheet" ||
  param === "menu" ||
  param === "stats" ||
  param === "code" ||
  param === "assistant"
    ? param
    : "card";
const root = document.getElementById("root");
if (root) createRoot(root).render(<App theme={theme} screen={screen} />);

import { createRoot } from "react-dom/client";
import { App } from "./App";

const theme = new URLSearchParams(location.search).get("theme") === "light" ? "light" : "dark";
const root = document.getElementById("root");
if (root) createRoot(root).render(<App theme={theme} />);

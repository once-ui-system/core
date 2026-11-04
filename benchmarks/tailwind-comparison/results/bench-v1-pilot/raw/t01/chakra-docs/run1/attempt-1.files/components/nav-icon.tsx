import {
  LuChartColumn,
  LuFileText,
  LuFolderKanban,
  LuSettings,
} from "react-icons/lu";
import type { IconName } from "@/lib/data";

export function NavIcon({ name }: { name: IconName }) {
  switch (name) {
    case "overview":
      return <LuChartColumn aria-hidden="true" />;
    case "reports":
      return <LuFileText aria-hidden="true" />;
    case "projects":
      return <LuFolderKanban aria-hidden="true" />;
    case "settings":
      return <LuSettings aria-hidden="true" />;
  }
}

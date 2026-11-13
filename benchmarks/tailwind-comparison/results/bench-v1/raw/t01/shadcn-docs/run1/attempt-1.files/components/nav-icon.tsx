import { BookOpen, Command, Frame, PieChart, Settings2 } from "lucide-react";
import type { ComponentProps } from "react";

import type { NavIconName } from "@/lib/data";

type IconProps = ComponentProps<typeof Command>;

export function NavIcon({ name, ...props }: { name: NavIconName } & IconProps) {
  switch (name) {
    case "overview":
      return <PieChart {...props} />;
    case "reports":
      return <BookOpen {...props} />;
    case "projects":
      return <Frame {...props} />;
    case "settings":
      return <Settings2 {...props} />;
  }
}

export function BrandIcon(props: IconProps) {
  return <Command {...props} />;
}

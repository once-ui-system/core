"use client";

import { createContext, useContext } from "react";
import { iconLibrary as defaultIcons, type IconComponent, type IconLibrary, type IconName } from "../icons";

export const IconContext = createContext<{
  icons: IconLibrary;
}>({
  icons: defaultIcons,
});

export const IconProvider = ({
  icons,
  children,
}: {
  icons?: Partial<IconLibrary> | Record<string, IconComponent>;
  children: React.ReactNode;
}) => {
  const mergedIcons = { ...defaultIcons } as IconLibrary;

  if (icons) {
    for (const [key, icon] of Object.entries(icons)) {
      if (icon !== undefined) {
        mergedIcons[key as IconName] = icon;
      }
    }
  }

  return <IconContext.Provider value={{ icons: mergedIcons }}>{children}</IconContext.Provider>;
};

export const useIcons = () => useContext(IconContext);

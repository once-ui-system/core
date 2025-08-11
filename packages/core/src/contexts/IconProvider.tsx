"use client";

import { createContext, useContext } from "react";
import { iconLibrary as defaultIcons, IconLibrary } from "../icons";

export const IconContext = createContext<{
  icons: IconLibrary;
}>({
  icons: defaultIcons,
});

export const IconProvider = ({
  icons,
  children,
}: {
  icons?: Partial<IconLibrary>;
  children: React.ReactNode;
}) => {
  const mergedIcons = { ...defaultIcons };

  if (icons) {
    Object.entries(icons).forEach(([key, icon]) => {
      if (icon !== undefined) {
        mergedIcons[key as keyof IconLibrary] = icon;
      }
    });
  }

  return <IconContext.Provider value={{ icons: mergedIcons }}>{children}</IconContext.Provider>;
};

export const useIcons = () => useContext(IconContext);

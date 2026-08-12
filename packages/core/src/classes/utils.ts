import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export const customTwMerge = extendTailwindMerge<"font-type" | "font-size-once">({
  extend: {
    classGroups: {
      "font-type": [{ font: ["heading", "display", "body", "label", "code"] }],
      "font-weight": [{ font: ["default", "normal", "medium", "strong"] }],
      "font-size-once": [{ font: ["xs", "s", "m", "l", "xl"] }],
      "font-family": [{ "font-family": ["heading", "display", "body", "label", "code"] }],
    },
    conflictingClassGroups: {
      "font-type": [],
      "font-weight": [],
      "font-size-once": [],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

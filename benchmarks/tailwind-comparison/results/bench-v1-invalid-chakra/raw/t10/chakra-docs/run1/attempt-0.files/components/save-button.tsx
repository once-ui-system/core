"use client";

import { IconButton } from "@chakra-ui/react";
import { LuHeart } from "react-icons/lu";

interface Props {
  saved: boolean;
  title: string;
  onToggle: () => void;
}

export function SaveButton({ saved, title, onToggle }: Props) {
  return (
    <IconButton
      size="sm"
      rounded="full"
      variant={saved ? "solid" : "surface"}
      colorPalette={saved ? "red" : "gray"}
      bg={saved ? undefined : "bg.panel"}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved homes` : `Save ${title}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <LuHeart fill={saved ? "currentColor" : "none"} />
    </IconButton>
  );
}

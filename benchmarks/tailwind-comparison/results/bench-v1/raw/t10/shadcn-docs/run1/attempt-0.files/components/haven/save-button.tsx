"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved-store";

export function SaveButton({
  homeId,
  title,
  className,
  withLabel = false,
}: {
  homeId: string;
  title: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { saved, toggle } = useSaved();
  const isSaved = saved.includes(homeId);

  return (
    <Button
      type="button"
      variant={withLabel ? "outline" : "secondary"}
      size={withLabel ? "default" : "icon-sm"}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${title} from saved homes` : `Save ${title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(homeId);
      }}
      className={cn("rounded-full", className)}
    >
      <Heart className={cn(isSaved && "fill-rose-500 text-rose-500")} aria-hidden="true" />
      {withLabel ? <span>{isSaved ? "Saved" : "Save"}</span> : null}
    </Button>
  );
}

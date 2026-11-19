"use client";

import { Grid, Media, PhotoViewer, type PhotoViewerItem } from "@once-ui-system/core";
import type React from "react";
import { useCallback, useRef, useState } from "react";

const photos: PhotoViewerItem[] = [
  {
    src: "/images/fashion/cover-01.jpg",
    alt: "Portrait in a knit beanie",
    title: "Beanie",
    caption: "01",
  },
  { src: "/images/fashion/jacket-01.jpg", alt: "Model in a green leather jacket", title: "Jacket" },
  { src: "/images/fashion/hoodie-02.jpg", alt: "Man in a marbled hoodie", title: "Hoodie" },
  { src: "/images/fashion/shoe-03.jpg", alt: "Pair of sneakers on yellow", title: "Sneakers" },
  { src: "/images/fashion/pants-02.jpg", alt: "Red cropped trousers", title: "Trousers" },
  { src: "/images/fashion/top-02.jpg", alt: "Man in a black tank top", title: "Tank top" },
];

export function PhotoViewerExample() {
  const [open, setOpen] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const getOrigin = useCallback(
    (index: number) =>
      gridRef.current?.querySelector<HTMLElement>(`[data-photo-index="${index}"]`) ?? null,
    [],
  );

  return (
    <>
      <Grid ref={gridRef} columns={3} gap="8" fillWidth s={{ columns: 2 }}>
        {photos.map((photo, index) => (
          <Media
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            aspectRatio="1 / 1"
            radius="m"
            sizes="(max-width: 768px) 50vw, 240px"
            role="button"
            tabIndex={0}
            aria-label={`View ${photo.alt}`}
            aria-haspopup="dialog"
            data-photo-index={index}
            className="cursor-zoom-in focus-ring"
            // Media sets `outline: none` inline, which would hide the keyboard focus ring.
            style={{ outline: undefined }}
            onClick={() => setOpen(index)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(index);
              }
            }}
          />
        ))}
      </Grid>
      {open !== null && (
        <PhotoViewer
          items={photos}
          defaultIndex={open}
          getOrigin={getOrigin}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

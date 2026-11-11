import { Column, Grid, Media, Row } from "@once-ui-system/core";
import { galleryLayouts } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface GallerySectionProps extends SectionBaseProps {
  items?: { image?: string; alt?: string; caption?: string }[];
}

type Picture = { key: string; src: string; alt: string; caption: string };

function Photo({
  picture,
  aspectRatio,
  sizes,
}: {
  picture: Picture;
  aspectRatio?: string;
  sizes: string;
}) {
  return (
    <Media
      enlarge
      src={picture.src}
      alt={picture.alt}
      aspectRatio={aspectRatio}
      radius="l"
      border
      sizes={sizes}
      caption={picture.caption || undefined}
    />
  );
}

// Photos of the work, the place or the product, shown for themselves.
// `grid` sets them in even tiles, `mosaic` gives the first one two thirds of
// the width beside two stacked, the rest in tiles beneath, and `masonry`
// keeps each photo's own shape in columns. Every photo opens large on a click.
export function GallerySection(props: GallerySectionProps) {
  const layout = choice(props.layout, galleryLayouts, "grid");
  const width = sectionWidth(props.width);
  const pictures: Picture[] = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.image)}`,
      src: text(item.image),
      alt: text(item.alt),
      caption: text(item.caption),
    }))
    .filter((p) => p.src);

  const header = (
    <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
  );
  const tiles = (list: Picture[]) =>
    list.length > 0 && (
      <Grid
        fillWidth
        columns={Math.min(3, Math.max(list.length, 2)) as 2 | 3}
        m={{ columns: 2 }}
        gap="16"
      >
        {list.map((picture) => (
          <Photo
            key={picture.key}
            picture={picture}
            aspectRatio="4 / 3"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ))}
      </Grid>
    );

  if (layout === "masonry") {
    return (
      <SectionShell width={width}>
        {header}
        <Grid masonry fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
          {pictures.map((picture) => (
            <Photo key={picture.key} picture={picture} sizes="(max-width: 768px) 100vw, 33vw" />
          ))}
        </Grid>
      </SectionShell>
    );
  }

  if (layout === "mosaic" && pictures.length >= 3) {
    const [lead, second, third, ...rest] = pictures as [Picture, Picture, Picture, ...Picture[]];
    return (
      <SectionShell width={width}>
        {header}
        <Column fillWidth gap="16">
          <Row fillWidth gap="16" m={{ direction: "column" }}>
            <Column flex={2} m={{ flex: "0" }}>
              <Photo picture={lead} aspectRatio="4 / 3" sizes="(max-width: 768px) 100vw, 66vw" />
            </Column>
            <Column
              flex={1}
              m={{ flex: "0", direction: "row" }}
              s={{ direction: "column" }}
              gap="16"
            >
              <Photo picture={second} aspectRatio="4 / 3" sizes="(max-width: 768px) 100vw, 33vw" />
              <Photo picture={third} aspectRatio="4 / 3" sizes="(max-width: 768px) 100vw, 33vw" />
            </Column>
          </Row>
          {tiles(rest)}
        </Column>
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width}>
      {header}
      {tiles(pictures)}
    </SectionShell>
  );
}

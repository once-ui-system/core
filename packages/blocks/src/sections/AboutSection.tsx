import { Column, Media, Row, Text } from "@once-ui-system/core";
import { aboutLayouts, IMAGE_SIDES } from "./layouts.js";
import { choice, text } from "./props.js";
import {
  SectionActions,
  type SectionBaseProps,
  SectionHeader,
  SectionShell,
  sectionWidth,
} from "./shared.js";

export interface AboutSectionProps extends SectionBaseProps {
  /** Longer text; a blank line starts a new paragraph. */
  body?: string;
  image?: string;
  imageAlt?: string;
  imageSide?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/** The body split into paragraphs at blank lines. */
const paragraphs = (value: unknown) =>
  text(value)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

// A story told beside a picture: who you are, how you work, why it matters.
// `split` puts the words and the picture side by side, on the side the page
// picks; `stacked` runs the picture wide above two columns of words.
export function AboutSection(props: AboutSectionProps) {
  const layout = choice(props.layout, aboutLayouts, "split");
  const width = sectionWidth(props.width);
  const image = text(props.image);
  const alt = text(props.imageAlt);
  const imageLeft = choice(props.imageSide, IMAGE_SIDES, "right") === "left";

  const body = paragraphs(props.body);
  const bodyText = body.length > 0 && (
    <Column gap="16">
      {body.map((paragraph, index) => (
        <Text
          // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs have no identity beyond their order
          key={index}
          as="p"
          textVariant="body-default-m"
          onBackground="neutral-medium"
          wrap="pretty"
        >
          {paragraph}
        </Text>
      ))}
    </Column>
  );
  const actions = (
    <SectionActions
      primaryLabel={props.primaryLabel}
      primaryHref={props.primaryHref}
      secondaryLabel={props.secondaryLabel}
      secondaryHref={props.secondaryHref}
      resolveHref={props.resolveHref}
    />
  );
  const header = (
    <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
  );

  if (layout === "stacked") {
    return (
      <SectionShell width={width}>
        {image && (
          <Media
            src={image}
            alt={alt}
            aspectRatio="21 / 9"
            radius="l"
            border
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}
        <Row fillWidth gap="64" m={{ direction: "column", gap: "24" }}>
          <Column flex={1} m={{ flex: "0" }}>
            {header}
          </Column>
          <Column flex={1} m={{ flex: "0" }} gap="32">
            {bodyText}
            {actions}
          </Column>
        </Row>
      </SectionShell>
    );
  }

  const picture = image && (
    <Media
      flex={1}
      src={image}
      alt={alt}
      aspectRatio="4 / 5"
      radius="l"
      border
      sizes="(max-width: 1024px) 100vw, 560px"
    />
  );
  return (
    <SectionShell width={width}>
      <Row
        fillWidth
        gap="64"
        vertical="center"
        direction={imageLeft ? "row-reverse" : "row"}
        m={{ direction: "column", vertical: "start", gap: "32" }}
      >
        <Column flex={1} m={{ flex: "0" }} gap="32">
          {header}
          {bodyText}
          {actions}
        </Column>
        {picture}
      </Row>
    </SectionShell>
  );
}

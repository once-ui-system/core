import { Column, Fade, Media, Row } from "@once-ui-system/core";
import { heroLayouts } from "./layouts.js";
import { choice, text } from "./props.js";
import {
  SectionActions,
  type SectionBaseProps,
  SectionHeader,
  SectionShell,
  sectionWidth,
} from "./shared.js";

export interface HeroSectionProps extends SectionBaseProps {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image?: string;
  imageAlt?: string;
}

// The page's opening: eyebrow, headline, lead, two buttons and a picture,
// arranged by `layout`. Every layout shows the same fields, so switching never
// hides something that was written, and each still reads as a complete
// opening without a picture.
export function HeroSection(props: HeroSectionProps) {
  const layout = choice(props.layout, heroLayouts, "split");
  const width = sectionWidth(props.width);
  const image = text(props.image);
  const alt = text(props.imageAlt);
  const centered = layout === "centered";
  // The layouts where the words carry the screen set the headline one size up.
  const display = layout === "fullscreen" || layout === "editorial";

  const words = (
    <>
      <SectionHeader
        hero
        display={display}
        center={centered}
        eyebrow={props.eyebrow}
        title={props.title}
        description={props.description}
      />
      <SectionActions
        center={centered}
        size="l"
        primaryLabel={props.primaryLabel}
        primaryHref={props.primaryHref}
        secondaryLabel={props.secondaryLabel}
        secondaryHref={props.secondaryHref}
        resolveHref={props.resolveHref}
      />
    </>
  );

  if (layout === "centered") {
    return (
      <SectionShell width={width} horizontal="center" gap="48">
        <Column horizontal="center" gap="32">
          {words}
        </Column>
        {image && (
          <Media
            priority
            src={image}
            alt={alt}
            aspectRatio="16 / 9"
            radius="l"
            border
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}
      </SectionShell>
    );
  }

  if (layout === "fullscreen") {
    // The picture fills the page's width and most of the screen, faded into
    // the page under the words at its foot: the first thing a visitor sees is
    // the photo, not a frame around it. Without a picture it stands on the
    // brand's tint at the same height, so the opening keeps its weight.
    return (
      <Column as="section" fillWidth>
        <Column
          fillWidth
          minHeight="calc(100dvh - 10rem)"
          m={{ minHeight: "40rem" }}
          s={{ minHeight: "32rem" }}
          vertical="end"
          radius="xl"
          overflow="hidden"
          background={image ? "surface" : "brand-alpha-weak"}
        >
          {image && (
            <>
              <Media
                position="absolute"
                top="0"
                left="0"
                fill
                priority
                src={image}
                alt={alt}
                sizes="100vw"
              />
              <Fade
                to="top"
                base="page"
                position="absolute"
                bottom="0"
                left="0"
                fillWidth
                height="24rem"
                pointerEvents="none"
              />
            </>
          )}
          <Column
            zIndex={1}
            maxWidth="48rem"
            gap="32"
            padding="48"
            m={{ padding: "32" }}
            s={{ padding: "24" }}
          >
            {words}
          </Column>
        </Column>
      </Column>
    );
  }

  if (layout === "halves") {
    // The section cut in two: the words on one half, the picture filling the
    // other to the frame's edge. On a phone the picture goes on top.
    return (
      <Row
        as="section"
        fillWidth
        minHeight="calc(100dvh - 10rem)"
        radius="xl"
        border
        overflow="hidden"
        background="surface"
        m={{ direction: "column-reverse", minHeight: "0" }}
      >
        <Column flex={1} vertical="center" padding="48" m={{ padding: "32" }} s={{ padding: "24" }}>
          <Column maxWidth="36rem" gap="32">
            {words}
          </Column>
        </Column>
        {image && (
          <Column flex={1} minHeight="24rem" m={{ flex: "0" }} s={{ minHeight: "20rem" }}>
            <Media
              position="absolute"
              top="0"
              left="0"
              fill
              priority
              src={image}
              alt={alt}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </Column>
        )}
      </Row>
    );
  }

  if (layout === "editorial") {
    // Words first: a headline as wide as the section, the lead and the
    // buttons side by side under a rule, the picture a wide band beneath.
    return (
      <SectionShell width={width} gap="40">
        {text(props.eyebrow) || text(props.title) ? (
          <SectionHeader
            hero
            display
            eyebrow={props.eyebrow}
            title={props.title}
            maxWidth="64rem"
          />
        ) : null}
        <Row
          fillWidth
          gap="32"
          paddingTop="24"
          borderTop="neutral-alpha-medium"
          vertical="end"
          horizontal="between"
          m={{ direction: "column", vertical: "start", horizontal: "start" }}
        >
          <SectionHeader description={props.description} maxWidth="32rem" />
          <SectionActions
            size="l"
            primaryLabel={props.primaryLabel}
            primaryHref={props.primaryHref}
            secondaryLabel={props.secondaryLabel}
            secondaryHref={props.secondaryHref}
            resolveHref={props.resolveHref}
          />
        </Row>
        {image && (
          <Media
            priority
            src={image}
            alt={alt}
            aspectRatio="21 / 9"
            s={{ aspectRatio: "4 / 3" }}
            radius="xl"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}
      </SectionShell>
    );
  }

  if (layout === "cover") {
    // The picture fills a tall frame and fades into the page under the words,
    // so they stay readable on any photo.
    return (
      <SectionShell width={width}>
        <Column
          fillWidth
          minHeight="40rem"
          s={{ minHeight: "32rem" }}
          vertical="end"
          radius="xl"
          border
          overflow="hidden"
          background={image ? "surface" : "brand-alpha-weak"}
        >
          {image && (
            <>
              <Media
                position="absolute"
                top="0"
                left="0"
                fill
                priority
                src={image}
                alt={alt}
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <Fade
                to="top"
                base="page"
                position="absolute"
                top="0"
                left="0"
                fill
                pointerEvents="none"
              />
            </>
          )}
          <Column zIndex={1} maxWidth="40rem" gap="32" padding="48" s={{ padding: "24" }}>
            {words}
          </Column>
        </Column>
      </SectionShell>
    );
  }

  if (layout === "boxed") {
    return (
      <SectionShell width={width}>
        <Row
          fillWidth
          gap="40"
          padding="48"
          vertical="center"
          radius="xl"
          border
          background="surface"
          m={{ direction: "column", vertical: "start", padding: "32" }}
          s={{ padding: "24" }}
        >
          <Column flex={1} m={{ flex: "0" }} gap="32">
            {words}
          </Column>
          {image && (
            <Media
              flex={1}
              priority
              src={image}
              alt={alt}
              aspectRatio="4 / 3"
              radius="l"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          )}
        </Row>
      </SectionShell>
    );
  }

  // Split: the words beside a portrait picture; stacked on a phone.
  return (
    <SectionShell width={width}>
      <Row fillWidth gap="48" vertical="center" m={{ direction: "column", vertical: "start" }}>
        <Column flex={1} m={{ flex: "0" }} gap="32">
          {words}
        </Column>
        {image && (
          <Media
            flex={1}
            priority
            src={image}
            alt={alt}
            aspectRatio="4 / 5"
            radius="l"
            border
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        )}
      </Row>
    </SectionShell>
  );
}

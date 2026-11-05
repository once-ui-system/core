import { Grid, Logo, Row } from "@once-ui-system/core";
import { logosLayouts } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface LogosSectionProps extends SectionBaseProps {
  /** `srcDark`, when given, replaces `src` in dark mode — most logos come in a light and a dark version. */
  items?: { src?: string; srcDark?: string; href?: string }[];
}

// The names that vouch for the work: clients, press, partners. `row` sets
// the logos in one centred line that wraps; `grid` gives each its own tile.
export function LogosSection(props: LogosSectionProps) {
  const layout = choice(props.layout, logosLayouts, "row");
  const width = sectionWidth(props.width);
  const logos = rows(props.items)
    .map((item, index) => {
      const src = text(item.src);
      const dark = text(item.srcDark);
      return {
        key: `${index}-${src}`,
        wordmark: dark ? { light: src, dark } : src,
        href: text(item.href)
          ? (props.resolveHref?.(text(item.href)) ?? text(item.href))
          : undefined,
        src,
      };
    })
    .filter((logo) => logo.src);

  const header = (
    <SectionHeader
      center
      eyebrow={props.eyebrow}
      title={props.title}
      description={props.description}
    />
  );

  if (layout === "grid") {
    return (
      <SectionShell width={width} horizontal="center">
        {header}
        <Grid fillWidth columns="4" m={{ columns: 3 }} s={{ columns: 2 }} gap="12">
          {logos.map((logo) => (
            <Row
              key={logo.key}
              center
              paddingX="24"
              paddingY="32"
              radius="l"
              border
              background="surface"
            >
              <Logo size="m" wordmark={logo.wordmark} href={logo.href} />
            </Row>
          ))}
        </Grid>
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width} horizontal="center" gap="32">
      {header}
      <Row fillWidth wrap center gap="48" s={{ gap: "32" }}>
        {logos.map((logo) => (
          <Logo key={logo.key} size="m" wordmark={logo.wordmark} href={logo.href} />
        ))}
      </Row>
    </SectionShell>
  );
}

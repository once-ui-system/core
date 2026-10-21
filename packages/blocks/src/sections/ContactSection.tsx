import { Button, Column, Grid, Row, SmartLink, Text } from "@once-ui-system/core";
import { contactLayouts } from "./layouts.js";
import { action, choice, lines, text } from "./props.js";
import {
  type SectionBaseProps,
  SectionHeader,
  SectionIcon,
  SectionShell,
  sectionWidth,
} from "./shared.js";

export interface ContactSectionProps extends SectionBaseProps {
  email?: string;
  phone?: string;
  address?: string;
  /** One line per entry, e.g. "Mon–Fri 9:00–17:00". */
  hours?: string;
  /** A maps link for the address (opened, never embedded). */
  mapHref?: string;
  primaryLabel?: string;
  primaryHref?: string;
}

type Detail = {
  key: string;
  icon: string;
  /** The value, one line per entry. */
  lines: string[];
  href?: string;
};

/**
 * The ways to get in touch, in a fixed order. Each is told apart by its icon
 * rather than a label, so the section reads in whatever language the site is
 * written in. Every one is a plain link or text: nothing here collects data or
 * loads a third party, so the section needs no consent gate.
 */
function contactDetails(props: ContactSectionProps): Detail[] {
  const email = text(props.email);
  const phone = text(props.phone);
  const address = lines(props.address);
  const hours = lines(props.hours);
  const mapHref = text(props.mapHref);
  const details: Detail[] = [];
  if (email) details.push({ key: "email", icon: "mail", lines: [email], href: `mailto:${email}` });
  if (phone) {
    details.push({
      key: "phone",
      icon: "phone",
      lines: [phone],
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  }
  if (address.length > 0) {
    details.push({
      key: "address",
      icon: "mapPin",
      lines: address,
      href: mapHref ? (props.resolveHref?.(mapHref) ?? mapHref) : undefined,
    });
  }
  if (hours.length > 0) details.push({ key: "hours", icon: "time", lines: hours });
  return details;
}

function DetailIcon({ name }: { name: string }) {
  return <SectionIcon name={name} />;
}

/** The value's lines; a linked detail's lines are one link. */
function DetailLines({ detail }: { detail: Detail }) {
  const body = (
    <Column gap="4">
      {detail.lines.map((line, index) => (
        <Text
          // biome-ignore lint/suspicious/noArrayIndexKey: lines of an address or of opening hours have no identity beyond their order
          key={index}
          textVariant="body-default-m"
          onBackground="neutral-strong"
        >
          {line}
        </Text>
      ))}
    </Column>
  );
  return detail.href ? <SmartLink href={detail.href}>{body}</SmartLink> : body;
}

function DetailRow({ detail }: { detail: Detail }) {
  return (
    <Row gap="16" vertical="center" paddingY="8">
      <DetailIcon name={detail.icon} />
      <DetailLines detail={detail} />
    </Row>
  );
}

// How to reach you: email, phone, address and opening hours, each a link
// where it can be one (mailto, tel, a maps link), plus one button. `split`
// sets the heading beside the details, `cards` gives each detail a tile,
// `centered` stacks everything in one centred column.
export function ContactSection(props: ContactSectionProps) {
  const layout = choice(props.layout, contactLayouts, "split");
  const width = sectionWidth(props.width);
  const details = contactDetails(props);
  const cta = action(props.primaryLabel, props.primaryHref, props.resolveHref);
  const centered = layout === "centered";

  const header = (
    <SectionHeader
      center={centered}
      eyebrow={props.eyebrow}
      title={props.title}
      description={props.description}
    />
  );
  const button = cta && (
    <Row horizontal={centered ? "center" : "start"}>
      <Button href={cta.href} size="l" arrowIcon>
        {cta.label}
      </Button>
    </Row>
  );

  if (layout === "cards") {
    return (
      <SectionShell width={width}>
        {header}
        <Grid
          fillWidth
          columns={Math.min(4, Math.max(1, details.length)) as 1 | 2 | 3 | 4}
          m={{ columns: Math.min(2, Math.max(1, details.length)) as 1 | 2 }}
          s={{ columns: 1 }}
          gap="16"
        >
          {details.map((detail) => (
            <Column key={detail.key} gap="16" padding="24" radius="l" border background="surface">
              <DetailIcon name={detail.icon} />
              <DetailLines detail={detail} />
            </Column>
          ))}
        </Grid>
        {button}
      </SectionShell>
    );
  }

  if (centered) {
    return (
      <SectionShell width={width} horizontal="center" gap="32">
        {header}
        <Column maxWidth="28rem" gap="8" horizontal="start">
          {details.map((detail) => (
            <DetailRow key={detail.key} detail={detail} />
          ))}
        </Column>
        {button}
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width}>
      <Row fillWidth gap="64" m={{ direction: "column", gap: "32" }}>
        <Column flex={1} m={{ flex: "0" }} gap="32">
          {header}
          {button}
        </Column>
        <Column flex={1} m={{ flex: "0" }} gap="8">
          {details.map((detail) => (
            <DetailRow key={detail.key} detail={detail} />
          ))}
        </Column>
      </Row>
    </SectionShell>
  );
}

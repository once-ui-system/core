"use client";

import {
  Background,
  Card,
  Column,
  Icon,
  type IconName,
  Logo,
  MegaMenu,
  type MenuGroup,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";

/** One link in a custom panel: icon tile, title and a line of description. */
function PanelLink({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <Card href="#" paddingX="12" paddingY="4" radius="l" gap="12" vertical="center" border="transparent">
      <Row
        center
        minWidth="40"
        width="40"
        height="40"
        radius="m"
        background="neutral-alpha-weak"
        border="neutral-alpha-weak"
      >
        <Icon name={icon} size="s" onBackground="neutral-strong" />
      </Row>
      <Column gap="2" minWidth={0}>
        <Text textVariant="label-strong-s" onBackground="neutral-strong">
          {title}
        </Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
          {description}
        </Text>
      </Column>
    </Card>
  );
}

const BARS = [28, 44, 36, 60, 52, 76];

/**
 * A launch card that leads a panel: a cover with a brand glow and a small
 * live chart, then the tag, title, copy and call to action.
 */
function FeaturedCard() {
  return (
    <Card
      href="#"
      direction="column"
      width="12.5rem"
      radius="l"
      overflow="hidden"
      background="surface"
      border="neutral-alpha-medium"
    >
      <Column fillWidth height={120} position="relative" overflow="hidden" background="page">
        <Background
          position="absolute"
          fill
          gradient={{
            display: true,
            x: "50%",
            y: "120%",
            width: "90%",
            height: "110%",
            colorStart: "brand-solid-strong",
            colorEnd: "static-transparent",
          }}
          dots={{ display: true, color: "brand-on-background-weak", size: "8", opacity: 40 }}
        />
        <Row
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          gap="8"
          horizontal="center"
          vertical="end"
        >
          {BARS.map((height, i) => (
            <Column
              key={height}
              width={16}
              height={height}
              topLeftRadius="s"
              topRightRadius="s"
              {...(i === BARS.length - 1
                ? { solid: "brand-strong" as const }
                : { background: "surface" as const, border: "neutral-alpha-medium" as const })}
            />
          ))}
        </Row>
        <Row position="absolute" top="12" left="12">
          <Tag size="s" tone="brand" label="New" />
        </Row>
      </Column>
      <Column fillWidth padding="16" gap="8" borderTop="neutral-alpha-weak">
        <Text textVariant="heading-strong-s" onBackground="neutral-strong">
          Ledger 2.0 is here
        </Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Live dashboards, faster sync.
        </Text>
        <Row gap="4" vertical="center" marginTop="4">
          <Text textVariant="label-strong-s" onBackground="brand-medium">
            Read the launch post
          </Text>
          <Icon name="arrowRight" size="xs" onBackground="brand-medium" />
        </Row>
      </Column>
    </Card>
  );
}

/** The groups of the site header example: sections, a custom panel with a featured card, a plain link. */
export const SITE_MENU: MenuGroup[] = [
  {
    id: "product",
    label: "Product",
    suffixIcon: "chevronDown",
    sections: [
      {
        title: "Platform",
        links: [
          {
            label: "Dashboards",
            href: "#",
            icon: "barChart",
            description: "One live view",
          },
          {
            label: "Reports",
            href: "#",
            icon: "document",
            description: "Sent every Monday",
          },
          {
            label: "Automations",
            href: "#",
            icon: "bolt",
            description: "Act when numbers move",
          },
        ],
      },
      {
        title: "Connect",
        links: [
          {
            label: "Integrations",
            href: "#",
            icon: "puzzle",
            description: "Stripe, HubSpot, 80 more",
          },
          {
            label: "API",
            href: "#",
            icon: "code",
            description: "Build on your data",
          },
          {
            label: "Security",
            href: "#",
            icon: "security",
            description: "SSO and audit logs",
          },
        ],
      },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    suffixIcon: "chevronDown",
    content: (
      <Row gap="12" padding="4" s={{ direction: "column" }}>
        <Column gap="4" width={192}>
          <Row paddingX="12" paddingY="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              By team
            </Text>
          </Row>
          <PanelLink
            icon="trendUp"
            title="Finance"
            description="Close the month faster"
          />
          <PanelLink
            icon="megaphone"
            title="Marketing"
            description="Spend that pays back"
          />
          <PanelLink
            icon="people"
            title="Operations"
            description="Hiring and capacity"
          />
        </Column>
        <FeaturedCard />
      </Row>
    ),
  },
  {
    id: "resources",
    label: "Resources",
    suffixIcon: "chevronDown",
    sections: [
      {
        title: "Learn and get help",
        links: [
          {
            label: "Documentation",
            href: "#",
            icon: "book",
            description: "Guides and the API reference",
          },
          {
            label: "Changelog",
            href: "#",
            icon: "newspaper",
            description: "What shipped this week",
          },
          {
            label: "Help center",
            href: "#",
            icon: "lifebuoy",
            description: "Answers to common questions",
          },
          {
            label: "Community",
            href: "#",
            icon: "chat",
            description: "Ask other Ledger teams",
          },
        ],
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "#",
  },
];

/**
 * A site header the menu sits in: brand, the bar, actions, and a hero below
 * for the panels to open over, so the preview reads like a page.
 */
function SiteFrame({ groups, height = 512 }: { groups: MenuGroup[]; height?: number }) {
  return (
    <Column fillWidth height={height} background="page">
      <Row
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        borderBottom="neutral-alpha-weak"
        zIndex={1}
      >
        <Logo text="Ledger" symbol="barChart" tone="brand" size="s" href="#" />
        <Row flex={1}>
          <MegaMenu menuGroups={groups} />
        </Row>
      </Row>
      <Column fillWidth flex={1} center gap="16" padding="32" align="center">
        <Tag size="s" label="Hover a menu above" />
        <Text textVariant="display-strong-xs" onBackground="neutral-strong" align="center">
          Numbers your whole team trusts
        </Text>
        <Text textVariant="body-default-m" onBackground="neutral-weak" align="center">
          Ledger turns your tools into one live dashboard.
        </Text>
      </Column>
    </Column>
  );
}

/** The full header: section panels, a custom panel with a featured card, a plain link. */
export function MegaMenuSiteExample() {
  return <SiteFrame groups={SITE_MENU} />;
}

/** One custom panel: a list of team pages beside a launch card. */
export function MegaMenuCustomExample() {
  return (
    <SiteFrame
      height={416}
      groups={SITE_MENU.filter((g) => g.id === "solutions" || g.id === "pricing")}
    />
  );
}

"use client";

import {
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

/** A launch card that leads a panel: tinted surface, tag, heading and a call to action. */
function FeaturedCard() {
  return (
    <Card
      href="#"
      direction="column"
      width="12rem"
      padding="16"
      gap="12"
      radius="l"
      background="brand-alpha-weak"
      border="brand-alpha-medium"
    >
      <Row
        center
        width="40"
        height="40"
        radius="m"
        solid="brand-strong"
        marginBottom="8"
      >
        <Icon name="rocket" size="s" onSolid="brand-strong" />
      </Row>
      <Tag size="s" tone="brand" label="New" />
      <Text textVariant="heading-strong-s" onBackground="neutral-strong">
        Ledger 2.0 is here
      </Text>
      <Text textVariant="body-default-s" onBackground="neutral-medium">
        Live dashboards and a faster sync for every team.
      </Text>
      <Row gap="4" vertical="center" marginTop="8">
        <Text textVariant="label-strong-s" onBackground="brand-strong">
          Read the launch post
        </Text>
        <Icon name="arrowRight" size="xs" onBackground="brand-strong" />
      </Row>
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
        <Column gap="4" width={224}>
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
            description="Campaigns that pay back"
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
function SiteFrame({ groups, height = "32rem" }: { groups: MenuGroup[]; height?: string }) {
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
      height="26rem"
      groups={SITE_MENU.filter((g) => g.id === "solutions" || g.id === "pricing")}
    />
  );
}

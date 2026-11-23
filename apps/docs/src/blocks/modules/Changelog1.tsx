import {
  Button,
  Column,
  Heading,
  Line,
  Media,
  Row,
  Tag,
  Text,
  Timeline,
} from "@once-ui-system/core";

type Release = {
  version: string;
  date: string;
  title: string;
  summary: string;
  image?: string;
  changes: { kind: "New" | "Improved" | "Fixed"; text: string }[];
};

const releases: Release[] = [
  {
    version: "3.2",
    date: "Nov 18, 2026",
    title: "Agents read your design system",
    summary:
      "Every component ships a machine-readable slice, so coding agents write screens that look like yours on the first try.",
    image: "/images/blocks/dashboard-desktop.jpg",
    changes: [
      { kind: "New", text: "Task bundles for dashboards, settings and chat" },
      { kind: "New", text: "A validator that flags custom CSS and stray colours" },
      { kind: "Improved", text: "Charts glide between points on hover" },
    ],
  },
  {
    version: "3.1",
    date: "Oct 30, 2026",
    title: "Brand scopes",
    summary: "Give one section its own colours, fonts and theme without leaving the page's tokens.",
    changes: [
      { kind: "New", text: "StyleScope for a subtree's brand, accent and fonts" },
      { kind: "Fixed", text: "Sticky headers keep their blur in Safari" },
    ],
  },
  {
    version: "3.0",
    date: "Oct 2, 2026",
    title: "A smaller, sharper core",
    summary:
      "Effects and blocks moved to their own packages, and every prop name was made consistent.",
    changes: [
      { kind: "Improved", text: "Numbers on size props follow the token scale" },
      { kind: "Fixed", text: "Focus rings no longer clip inside scrollers" },
    ],
  },
];

const tone = { New: "brand", Improved: "accent", Fixed: "neutral" } as const;

/**
 * A changelog page: each release on a timeline with its version, date,
 * a summary, an optional screenshot and the list of changes.
 */
export const Changelog1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" paddingX="l" paddingY="80" {...flex}>
      <Column maxWidth="m" gap="48">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="24"
          s={{ direction: "column", vertical: "start" }}
        >
          <Column gap="12">
            <Text textVariant="label-default-s" onBackground="brand-medium">
              Changelog
            </Text>
            <Heading as="h1" textVariant="display-strong-s">
              What's new
            </Heading>
            <Text textVariant="body-default-l" onBackground="neutral-weak">
              New features, improvements and fixes, release by release.
            </Text>
          </Column>
          <Button variant="secondary" prefixIcon="mail" href="#">
            Get updates
          </Button>
        </Row>
        <Line />
        <Timeline
          items={releases.map((release) => ({
            label: (
              <Row gap="12" vertical="center" wrap>
                <Tag size="s" tone="brand">
                  v{release.version}
                </Tag>
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  {release.date}
                </Text>
              </Row>
            ),
            children: (
              <Column fillWidth gap="20" paddingBottom="40">
                <Column gap="8">
                  <Heading as="h2" textVariant="heading-strong-xl">
                    {release.title}
                  </Heading>
                  <Text onBackground="neutral-weak" wrap="pretty">
                    {release.summary}
                  </Text>
                </Column>
                {release.image && (
                  <Media
                    src={release.image}
                    alt={`Screenshot of ${release.title}`}
                    sizes="(max-width: 768px) 100vw, 720px"
                    aspectRatio="16 / 9"
                    radius="l"
                    border
                  />
                )}
                <Column as="ul" fillWidth background="surface" border radius="l">
                  {release.changes.map((change, index) => (
                    <Row
                      as="li"
                      key={change.text}
                      gap="16"
                      paddingX="16"
                      paddingY="12"
                      vertical="center"
                      borderTop={index > 0}
                    >
                      <Row minWidth="5rem">
                        <Tag size="s" tone={tone[change.kind]}>
                          {change.kind}
                        </Tag>
                      </Row>
                      <Text textVariant="body-default-s">{change.text}</Text>
                    </Row>
                  ))}
                </Column>
              </Column>
            ),
          }))}
        />
      </Column>
    </Column>
  );
};

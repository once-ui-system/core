import { Avatar, Column, Grid, Heading, Media, Row, Text } from "@once-ui-system/core";
import { SECTION_COLUMNS, teamLayouts } from "./layouts.js";
import { choice, rows, text } from "./props.js";
import { type SectionBaseProps, SectionHeader, SectionShell, sectionWidth } from "./shared.js";

export interface TeamSectionProps extends SectionBaseProps {
  columns?: string;
  items?: { name?: string; role?: string; bio?: string; photo?: string }[];
}

type Member = { key: string; name: string; role: string; bio: string; photo: string };

function MemberText({ member }: { member: Member }) {
  return (
    <Column gap="4">
      <Heading as="h3" textVariant="heading-strong-s">
        {member.name}
      </Heading>
      {member.role && (
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {member.role}
        </Text>
      )}
      {member.bio && (
        <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty" marginTop="8">
          {member.bio}
        </Text>
      )}
    </Column>
  );
}

// The people behind the work. `grid` gives each a square portrait card;
// `list` runs them as rows with a round portrait, which suits longer bios.
export function TeamSection(props: TeamSectionProps) {
  const layout = choice(props.layout, teamLayouts, "grid");
  const width = sectionWidth(props.width);
  const columns = Number(choice(props.columns, SECTION_COLUMNS, "3")) as 2 | 3 | 4;
  const members: Member[] = rows(props.items)
    .map((item, index) => ({
      key: `${index}-${text(item.name)}`,
      name: text(item.name),
      role: text(item.role),
      bio: text(item.bio),
      photo: text(item.photo),
    }))
    .filter((m) => m.name);

  const header = (
    <SectionHeader eyebrow={props.eyebrow} title={props.title} description={props.description} />
  );

  if (layout === "list") {
    return (
      <SectionShell width={width}>
        {header}
        <Column fillWidth>
          {members.map((member, index) => (
            <Row
              key={member.key}
              fillWidth
              gap="24"
              paddingY="24"
              borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
            >
              {member.photo ? (
                <Avatar size="l" src={member.photo} />
              ) : (
                <Avatar size="l" value={member.name.slice(0, 2).toUpperCase()} />
              )}
              <MemberText member={member} />
            </Row>
          ))}
        </Column>
      </SectionShell>
    );
  }

  return (
    <SectionShell width={width}>
      {header}
      <Grid fillWidth columns={columns} m={{ columns: 2 }} s={{ columns: 1 }} gap="32">
        {members.map((member) => (
          <Column key={member.key} gap="16">
            {member.photo && (
              <Media
                src={member.photo}
                alt={member.name}
                aspectRatio="1 / 1"
                radius="l"
                border
                sizes="(max-width: 768px) 100vw, 400px"
              />
            )}
            <MemberText member={member} />
          </Column>
        ))}
      </Grid>
    </SectionShell>
  );
}

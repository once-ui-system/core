import {
  AvatarGroup,
  Column,
  Flex,
  Grid,
  Row,
  SmartLink,
  Text,
  User,
} from "@once-ui-system/core";
import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

interface Testimonial {
  content: ReactNode;
  avatar?: string;
  name?: string;
  role?: string;
  link?: string;
  company?: string;
}

interface Props extends Omit<React.ComponentProps<typeof Flex>, "content"> {
  testimonials: Testimonial[];
}

/** Shows behind the photo while it loads, and in place of a missing one. */
const AVATAR_PLACEHOLDER = {
  background:
    "linear-gradient(135deg, var(--brand-background-strong), var(--accent-background-strong))",
};

/*
 * A grid of quotes under the section heading, every card in a row the same
 * height so the names line up.
 */
export const Testimonials: React.FC<Props> = ({ testimonials, ...flex }) => {
  // The avatar row only says something when the faces differ.
  const avatars = [...new Set(testimonials.map((t) => t.avatar).filter(Boolean))] as string[];

  return (
    <Column fillWidth horizontal="center" gap="48" {...flex}>
      <SectionHeader label="Testimonials" title="Loved by people who'd rather ship than set up">
        {avatars.length > 1 && (
          <AvatarGroup reverse size="s" avatars={avatars.slice(0, 5).map((src) => ({ src }))} />
        )}
      </SectionHeader>
      <Row fillWidth>
        <Grid fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
          {testimonials.map((testimonial, index) => (
            <Column
              key={index}
              background="surface"
              radius="xl"
              border="neutral-alpha-weak"
              vertical="between"
              padding="2"
              fill
            >
              <Flex padding="32" paddingBottom="8" fillWidth>
                <Text wrap="balance" variant="heading-default-xs">
                  {testimonial.content}
                </Text>
              </Flex>
              {(testimonial.role || testimonial.company) && (
                <Flex fillWidth paddingY="24" paddingX="32">
                  <User
                    avatarProps={{ src: testimonial.avatar, style: AVATAR_PLACEHOLDER }}
                    name={testimonial.name}
                    subline={
                      <>
                        {testimonial.role}{" "}
                        {testimonial.link && testimonial.company && (
                          <SmartLink unstyled href={testimonial.link}>
                            {testimonial.company}
                          </SmartLink>
                        )}
                      </>
                    }
                  />
                </Flex>
              )}
            </Column>
          ))}
        </Grid>
      </Row>
    </Column>
  );
};

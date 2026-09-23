import { Avatar, Column, Flex, Grid, Row, SmartLink, Text } from "@once-ui-system/core";
import type { ReactNode } from "react";

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
  avatars?: string[];
  avatarText?: string;
}

export const Testimonial3: React.FC<Props> = ({ testimonials, avatars, avatarText, ...rest }) => (
  <Column fillWidth horizontal="center" gap="64">
    <Column fillWidth gap="-1">
      <Row fillWidth height="24" border="neutral-medium" topRadius="l" />
      <Grid
        fillWidth
        columns={4}
        s={{ columns: 1 }}
        gap="0"
        borderTop="neutral-medium"
        borderLeft="neutral-medium"
      >
        {testimonials.map((testimonial, index) => (
          <Flex
            key={index}
            fillWidth
            borderRight="neutral-medium"
            borderBottom="neutral-medium"
            vertical="between"
            direction="column"
            padding="24"
            gap="20"
            {...rest}
          >
            <Text wrap="balance" variant="body-default-s">
              {testimonial.content}
            </Text>
            <Flex fillWidth>
              {(testimonial.role || testimonial.company) && (
                <Row gap="12">
                  <Avatar
                    style={{
                      mixBlendMode: "luminosity",
                    }}
                    size="m"
                    src={testimonial.avatar}
                  />
                  <Column>
                    <Text variant="label-default-s">{testimonial.name}</Text>
                    <Text onBackground="neutral-weak" variant="body-default-xs">
                      {testimonial.role}{" "}
                      {testimonial.link && testimonial.company && (
                        <SmartLink unstyled href={testimonial.link}>
                          {testimonial.company}
                        </SmartLink>
                      )}
                    </Text>
                  </Column>
                </Row>
              )}
            </Flex>
          </Flex>
        ))}
      </Grid>
      <Row fillWidth height="24" border="neutral-medium" bottomRadius="l" />
    </Column>
  </Column>
);

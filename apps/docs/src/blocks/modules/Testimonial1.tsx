import { Background, Column, Flex, Scroller, SmartLink, Text, User } from "@once-ui-system/core";
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
}

export const Testimonial1: React.FC<Props> = ({ testimonials, ...flex }) => (
  <Column fillWidth horizontal="center" gap="64">
    <Scroller>
      {testimonials.map((testimonial, index) => (
        <Background
          key={index}
          fillWidth
          background="surface"
          radius="l"
          border
          vertical="between"
          direction="column"
          marginRight="12"
          minWidth={20}
          {...flex}
        >
          <Flex padding="32" fillWidth>
            <Text wrap="balance" variant="heading-default-m">
              {testimonial.content}
            </Text>
          </Flex>
          <Flex borderTop fillWidth paddingY="24" paddingX="32">
            {(testimonial.role || testimonial.company) && (
              <User
                avatarProps={{ src: testimonial.avatar }}
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
            )}
          </Flex>
        </Background>
      ))}
    </Scroller>
  </Column>
);

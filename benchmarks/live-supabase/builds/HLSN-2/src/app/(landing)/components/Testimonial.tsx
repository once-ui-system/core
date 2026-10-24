import type { IconName } from "@once-ui-system/core";
import {
  Row,
  Column,
  Text,
  IconButton,
  User,
  SmartLink,
} from "@once-ui-system/core";
import type { ReactNode } from "react";

interface Testimonial {
  content: ReactNode;
  name?: string;
  role?: string;
  company?: string;
  companyUrl?: string;
  avatar?: string;
  socialLink?: string;
  socialIcon?: IconName;
}

interface props extends React.ComponentProps<typeof Column> {
  testimonial: Testimonial;
}

export const Testimonial: React.FC<props> = ({
  testimonial,
  ...flex
}) => {
  return (
    <Column fillWidth {...flex}>
      <Row
        padding="32"
        fillWidth
        vertical="center"
        background="page"
        radius="l"
        gap="12"
        border="neutral-alpha-medium"
      >
        {testimonial.socialLink && (
          <IconButton
            size="l"
            variant="tertiary"
            icon={testimonial.socialIcon}
            href={testimonial.socialLink}
          />
        )}
        <Text wrap="balance" variant="heading-default-m">
          {testimonial.content}
        </Text>
      </Row>
      <Row fillWidth paddingY="20" paddingX="24">
        <User
          avatarProps={{ src: testimonial.avatar }}
          name={testimonial.name}
          subline={
            testimonial.company ? (
              <>
                {testimonial.role && `${testimonial.role} `}
                {testimonial.companyUrl ? (
                  <SmartLink unstyled href={testimonial.companyUrl}>
                    @{testimonial.company}
                  </SmartLink>
                ) : (
                  testimonial.company && `@${testimonial.company}`
                )}
              </>
            ) : (
              testimonial.role
            )
          }
        />
      </Row>
    </Column>
  );
};
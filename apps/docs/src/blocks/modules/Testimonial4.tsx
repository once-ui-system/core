import {
  Column,
  type Flex,
  IconButton,
  type IconName,
  Row,
  SmartLink,
  Text,
  User,
} from "@once-ui-system/core";

interface companyProps {
  name?: string;
  url?: string;
}

interface socialProps {
  link?: string;
  icon?: IconName;
}

export interface Testimonial4Props extends React.ComponentProps<typeof Flex> {
  content: string;
  name: string;
  role?: string;
  avatar?: string;
  company?: companyProps;
  social?: socialProps;
  className?: string;
}

export const Testimonial4: React.FC<Testimonial4Props> = ({
  content,
  name,
  role,
  company,
  avatar,
  social,
  className,
  ...flex
}) => {
  return (
    <Column className={className} {...flex}>
      <Row
        padding="32"
        fillWidth
        vertical="center"
        background="page"
        marginTop="xl"
        radius="l"
        gap="12"
        border
      >
        <Text wrap="balance" variant="heading-default-m">
          {content}
        </Text>
        {social && <IconButton size="l" variant="tertiary" icon={social.icon} href={social.link} />}
      </Row>
      <Row fillWidth paddingY="20" paddingX="24">
        <User
          avatarProps={{ src: avatar }}
          name={name}
          subline={
            company ? (
              <>
                {role && `${role} `}
                {company.url ? (
                  <SmartLink unstyled href={company.url}>
                    @{company.name}
                  </SmartLink>
                ) : (
                  company.name && `@${company.name}`
                )}
              </>
            ) : (
              role
            )
          }
        />
      </Row>
    </Column>
  );
};

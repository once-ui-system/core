import {
  Background,
  Column,
  type Flex,
  Heading,
  Media,
  Row,
  SmartLink,
  Text,
  User,
} from "@once-ui-system/core";
import type { ReactNode } from "react";

interface Testimonial extends Omit<React.ComponentProps<typeof Flex>, "title" | "content"> {
  title?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  src?: string;
  alt?: string;
  name?: string;
  company?: string;
  link?: string;
  avatar?: string;
  role?: string;
}

export const Testimonial2: React.FC<Testimonial> = ({
  title,
  content,
  children,
  src,
  alt,
  name,
  company,
  link,
  avatar,
  role,
  ...rest
}) => (
  <Row
    fillWidth
    fitHeight
    vertical="center"
    overflow="hidden"
    radius="xl"
    background="overlay"
    border="neutral-alpha-weak"
    m={{ direction: "column" }}
    {...rest}
  >
    <Column flex={1} s={{ direction: "column" }}>
      <Column flex={1} padding="xl" gap="16" vertical="center">
        {title && (
          <Heading variant="display-default-s" style={{ lineHeight: 1 }}>
            <b>{title}</b>
          </Heading>
        )}
        {content && (
          <Text wrap="balance" variant="label-default-m" onBackground="neutral-medium">
            <b>{content}</b>
          </Text>
        )}
        {(name || company) && (
          <Row marginY="12">
            <User
              avatarProps={{ src: avatar }}
              name={name}
              subline={
                <>
                  {role}{" "}
                  {link && company && (
                    <SmartLink unstyled href={link}>
                      {company}
                    </SmartLink>
                  )}
                </>
              }
            />
          </Row>
        )}
        {children}
      </Column>
    </Column>
    {src && (
      <Row flex={1} fill minHeight={20}>
        <Row flex={1} fillHeight paddingTop="24" paddingLeft="24" vertical="end">
          <Background mask={{ x: 100, y: 50, radius: 150 }} aspectRatio="8/7" fitHeight>
            <Media
              stretch
              sizes="(max-width: 1024px) 90vw, 960px"
              src={src}
              alt={alt}
              border="neutral-alpha-weak"
              topLeftRadius="xl"
              fillWidth
              fillHeight
            />
          </Background>
        </Row>
      </Row>
    )}
  </Row>
);

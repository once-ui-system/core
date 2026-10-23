import {
  Column,
  type Flex,
  Heading,
  Row,
  Media,
  SmartLink,
  Text,
  User,
  Mask,
  MatrixFx,
} from "@once-ui-system/core";
import type { ReactNode } from "react";

interface TestimonialProps extends Omit<React.ComponentProps<typeof Flex>, "title" | "content"> {
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

export const Testimonial: React.FC<TestimonialProps> = ({
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
    vertical="center"
    overflow="hidden"
    radius="xl"
    background="overlay"
    border
    m={{direction: "column"}}
    {...rest}
  >
    <Mask position="absolute" x={0} y={100} radius={50}>
      <MatrixFx
        size={1.5}
        spacing={5}
        fps={24}
        colors={["brand-solid-strong"]}
        flicker
      />
    </Mask>
    <Column fillWidth s={{direction: "column"}}>
      <Column flex={1} padding="xl" gap="16" vertical="center">
        {title && <Heading as="h2" variant="display-strong-xs">{title}</Heading>}
        {content && (
          <Text wrap="balance" variant="body-default-m" onBackground="neutral-medium">
            {content}
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
      <Row fill minHeight={20} paddingTop="24" paddingLeft="24">
        <Media fill sizes="(max-width: 1024px) 90vw, 960px" src={src} alt={alt} border topLeftRadius="xl" />
      </Row>
    )}
  </Row>
);

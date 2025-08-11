import React from "react";
import { Column, SmartLink, Row, Line, Text, Heading, Media, Meta, Schema, HeadingLink } from "@once-ui-system/core";
import { baseURL, meta, schema, changelog } from "@/resources";
import { formatDate } from "../utils/formatDate";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.changelog.title,
    description: meta.changelog.description,
    baseURL: baseURL,
    path: meta.changelog.path,
    image: meta.changelog.image
  });
}

const Changelog: React.FC = () => {
  return (
    <Column
      maxWidth={56}
      as="main">
      <Schema
        as="webPage"
        title={meta.changelog.title}
        description={meta.changelog.description}
        baseURL={baseURL}
        path={meta.changelog.path}
        author={{
          name: schema.name
        }}
      />
      <Column fillWidth gap="8" paddingBottom="l">
        <Heading variant="display-strong-s">
          Changelog
        </Heading>
        <Text wrap="balance" onBackground="neutral-weak" variant="body-default-xl" marginBottom="20">
          See what&apos;s new in Once UI
        </Text>
      </Column>

      {changelog.map((entry, index) => (
        <Row key={entry.date} fillWidth gap="20" vertical="start" position="relative" s={{direction: "column"}}>
          <Column width={16} maxWidth={16} fillHeight>
            <Column maxWidth="160" fitWidth fillHeight>
              <Row
                position="sticky" top="80"
                fillWidth
                minHeight="32" 
                radius="full"
                center
                paddingX="16"
                paddingY="8"
                textVariant="label-default-s"
                onBackground="neutral-strong"
                border="neutral-alpha-weak"
                style={{backdropFilter: 'blur(1rem)'}}
              >
                {formatDate(entry.date)}
              </Row>
              {index < changelog.length - 1 && (
                <Line s={{hide: true}} marginLeft="40" vert background="neutral-alpha-weak"/>
              )}
            </Column>
          </Column>
          <Column fillWidth gap="12" paddingBottom="48">
            <HeadingLink id={entry.date} as="h2">
              {entry.title}
            </HeadingLink>
            
            {entry.description && (
              <Text variant="body-default-m" onBackground="neutral-weak">
                {entry.description}
              </Text>
            )}
            
            {entry.image && (
              <Media
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 768px"
                marginTop="20"
                radius="l"
                src={entry.image} 
                alt={`Illustration for ${entry.title}`}
                border="neutral-alpha-weak"
                aspectRatio="16 / 9"
              />
            )}
            
            {entry.sections.map((section, sectionIndex) => {
              return (
                <Column key={sectionIndex} fillWidth marginTop="20">
                  <Heading as="h3" marginBottom="8">
                    {section.title}
                  </Heading>
                  
                  {section.description && (
                    <Text variant="body-default-m" onBackground="neutral-weak" marginBottom="8">
                      {section.description}
                    </Text>
                  )}
                  
                  {section.bullets && section.bullets.length > 0 && (
                    <ul style={{marginTop: "var(--static-space-8)"}}>
                      {section.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>
                          <Text variant="body-default-m" onBackground="neutral-weak">
                            {bullet}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {section.link && (
                    <Row paddingY="8">
                      <SmartLink href={section.link} suffixIcon="chevronRight">
                        View update
                      </SmartLink>
                    </Row>
                  )}
                </Column>
              );
            })}
          </Column>
        </Row>
      ))}
    </Column>
  );
};

export default Changelog;
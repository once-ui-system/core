import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { CodeBlock } from "@once-ui-system/core/code";
import { promptSections } from "@/resources/prompts";

/**
 * The prompt library. Each card is a copyable starting point rather than a
 * demonstration: the angle brackets are the only thing a reader has to fill
 * in, and everything else — which rules file to read, which blocks match the
 * task — is already answered, because that is the part people get wrong.
 */
export function PromptLibrary() {
  return (
    <Column fillWidth gap="48" maxWidth={56}>
      {promptSections.map((section) => (
        <Column key={section.id} fillWidth gap="20">
          <Column gap="4">
            <Row vertical="center" gap="12" wrap>
              <Heading as="h2" variant="display-default-xs">
                {section.title}
              </Heading>
              {section.id === "pro" && <Tag size="s">Pro</Tag>}
            </Row>
            <Text onBackground="neutral-weak" variant="body-default-s">
              {section.description}
            </Text>
          </Column>

          <Column fillWidth gap="12">
            {section.prompts.map((prompt) => (
              <Column
                key={prompt.id}
                fillWidth
                gap="12"
                padding="20"
                radius="l"
                border="neutral-alpha-weak"
                background="overlay"
              >
                <Column gap="4">
                  <Text variant="heading-strong-xs">{prompt.title}</Text>
                  <Text onBackground="neutral-weak" variant="body-default-s">
                    {prompt.description}
                  </Text>
                </Column>
                <CodeBlock
                  compact
                  copyButton
                  isCollapsible
                  maxLines={6}
                  codes={[{ code: prompt.prompt, language: "markdown", label: prompt.title }]}
                />
              </Column>
            ))}
          </Column>
        </Column>
      ))}
    </Column>
  );
}

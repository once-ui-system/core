import { Button, Column, Heading, Text } from "@once-ui-system/core";
import { landingCopy } from "@/content";

/** The name, the tagline and the call to action. */
export const Hero: React.FC<React.ComponentProps<typeof Column>> = (props) => {
  const { hero } = landingCopy;
  return (
    <Column fillWidth horizontal="center" align="center" gap="24" paddingY="80" {...props}>
      <Heading as="h1" variant="display-strong-l" align="center">
        {hero.title}
      </Heading>
      <Text variant="heading-default-xl" onBackground="neutral-weak" align="center" wrap="balance">
        {hero.tagline}
      </Text>
      <Button size="l" label={hero.primary.label} href={hero.primary.href} arrowIcon />
    </Column>
  );
};

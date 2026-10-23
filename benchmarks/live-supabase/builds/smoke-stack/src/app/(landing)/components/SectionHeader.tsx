import { Column, Heading, Text } from "@once-ui-system/core";

interface SectionHeaderProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}

/** The label, title and lead every landing section opens with. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  description,
  children,
  ...flex
}) => (
  <Column maxWidth={40} gap="12" horizontal="center" align="center" {...flex}>
    <Text variant="label-strong-s" onBackground="brand-medium">
      {label}
    </Text>
    <Heading as="h2" variant="display-strong-s" wrap="balance">
      {title}
    </Heading>
    {description && (
      <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
        {description}
      </Text>
    )}
    {children}
  </Column>
);

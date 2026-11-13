import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <Column gap="8" flex={1} minWidth={16}>
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
        {description ? (
          <Text onBackground="neutral-weak" textVariant="body-default-m">
            {description}
          </Text>
        ) : null}
      </Column>
      {actions}
    </div>
  );
}

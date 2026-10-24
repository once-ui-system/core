'use client';

import { Column, Heading, Text, Button } from '@once-ui-system/core';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Column fill center>
      <Column maxWidth="s" gap="24" paddingX="l" align="center" horizontal="center">
        <Heading variant="display-strong-s">Oh no! It's broken...</Heading>
        <Text wrap="balance" marginBottom="8">
          An error occurred while rendering this page. This is what happened:
        </Text>
        <Text wrap="balance" variant="code-default-s" onBackground="brand-medium" marginBottom="24">
          {error.message || 'Unknown error'}
        </Text>
        <Button
          prefixIcon="refresh"
          weight="default"
          data-border="rounded"
          onClick={() => reset()}
        >
          Try again
        </Button>
      </Column>
    </Column>
  );
}

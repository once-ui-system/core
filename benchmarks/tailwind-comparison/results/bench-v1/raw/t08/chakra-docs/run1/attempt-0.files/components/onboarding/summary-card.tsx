"use client";

import { Badge, Box, Card, DataList, Heading, Text } from "@chakra-ui/react";
import { teamSizeOptions, themeOptions } from "@/lib/data";
import type { WizardValues } from "@/lib/wizard";

function Value({ children }: { children?: string }) {
  return children ? (
    <Text wordBreak="break-word">{children}</Text>
  ) : (
    <Text color="fg.subtle" fontStyle="italic">
      Not entered yet
    </Text>
  );
}

export function SummaryCard({ values }: { values: WizardValues }) {
  const teamSize = teamSizeOptions.find((o) => o.value === values.teamSize);
  const theme = themeOptions.find((o) => o.value === values.theme);
  const invites = values.invites.map((e) => e.trim()).filter(Boolean);

  return (
    <Card.Root variant="subtle" as="aside" aria-labelledby="summary-heading">
      <Card.Header>
        <Heading as="h2" id="summary-heading" size="md">
          Your setup so far
        </Heading>
        <Text textStyle="sm" color="fg.muted">
          Updates as you type.
        </Text>
      </Card.Header>
      <Card.Body>
        <DataList.Root orientation="vertical" gap="4">
          <DataList.Item>
            <DataList.ItemLabel>Name</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{values.name.trim()}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Work email</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{values.email.trim()}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Workspace</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{values.workspace.trim()}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Team size</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{teamSize?.label}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Invites</DataList.ItemLabel>
            <DataList.ItemValue>
              {invites.length ? (
                <Box display="flex" flexDirection="column" gap="1">
                  {invites.map((e) => (
                    <Text key={e} wordBreak="break-word">
                      {e}
                    </Text>
                  ))}
                </Box>
              ) : (
                <Text color="fg.subtle" fontStyle="italic">
                  None yet
                </Text>
              )}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Preferences</DataList.ItemLabel>
            <DataList.ItemValue>
              <Box display="flex" gap="2" flexWrap="wrap">
                <Badge colorPalette="blue">{theme?.label} theme</Badge>
                <Badge colorPalette={values.digest ? "green" : "gray"}>
                  {values.digest ? "Weekly digest on" : "Weekly digest off"}
                </Badge>
              </Box>
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
      </Card.Body>
    </Card.Root>
  );
}

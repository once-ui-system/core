"use client";

import { Container, Table, Text, Title, VisuallyHidden } from "@mantine/core";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { comparison } from "@/lib/data";
import classes from "./Pricing.module.css";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <>
        <IconCheck
          size={18}
          stroke={2}
          className={classes.check}
          aria-hidden="true"
        />
        <VisuallyHidden>Included</VisuallyHidden>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <IconMinus size={18} stroke={1.5} aria-hidden="true" />
        <VisuallyHidden>Not included</VisuallyHidden>
      </>
    );
  }
  return <>{value}</>;
}

export function ComparisonTable() {
  return (
    <Container className={classes.section} aria-labelledby="compare-title" component="section">
      <Title order={2} id="compare-title" mb="xs">
        Compare plans
      </Title>
      <Text c="dimmed" mb="lg">
        Everything side by side, so there are no surprises at checkout.
      </Text>

      <div className={classes.tableWrap}>
        <Table.ScrollContainer minWidth={560} type="native">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Feature</Table.Th>
                <Table.Th scope="col">Free</Table.Th>
                <Table.Th scope="col" className={classes.highlightCol}>
                  Team
                </Table.Th>
                <Table.Th scope="col">Business</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {comparison.map((row) => (
                <Table.Tr key={row.feature}>
                  <Table.Th scope="row" fw={600}>
                    {row.feature}
                  </Table.Th>
                  <Table.Td>
                    <Cell value={row.free} />
                  </Table.Td>
                  <Table.Td className={classes.highlightCol}>
                    <Cell value={row.team} />
                  </Table.Td>
                  <Table.Td>
                    <Cell value={row.business} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
    </Container>
  );
}

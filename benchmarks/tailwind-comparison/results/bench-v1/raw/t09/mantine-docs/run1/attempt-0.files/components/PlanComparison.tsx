import { Table, Text, VisuallyHidden } from "@mantine/core";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { comparison, plans, type ComparisonValue } from "@/lib/data";
import classes from "./PlanComparison.module.css";

function Cell({ value }: { value: ComparisonValue }) {
  if (typeof value === "string") {
    return <Text size="sm">{value}</Text>;
  }
  return value ? (
    <>
      <IconCheck size={18} stroke={2.25} className={classes.yes} aria-hidden="true" />
      <VisuallyHidden>Included</VisuallyHidden>
    </>
  ) : (
    <>
      <IconMinus size={18} stroke={1.75} className={classes.no} aria-hidden="true" />
      <VisuallyHidden>Not included</VisuallyHidden>
    </>
  );
}

export function PlanComparison() {
  return (
    <Table.ScrollContainer minWidth={560} type="native">
      <Table withTableBorder withRowBorders className={classes.table}>
        <Table.Caption>Feature comparison of the Free, Team and Business plans</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th scope="col">Feature</Table.Th>
            {plans.map((plan) => (
              <Table.Th
                key={plan.name}
                scope="col"
                className={classes.planHead}
                data-highlight={plan.highlight || undefined}
              >
                {plan.name}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {comparison.map((row) => (
            <Table.Tr key={row.feature}>
              <Table.Th scope="row" className={classes.rowHead}>
                {row.feature}
              </Table.Th>
              <Table.Td className={classes.cell}>
                <Cell value={row.free} />
              </Table.Td>
              <Table.Td className={classes.cell} data-highlight>
                <Cell value={row.team} />
              </Table.Td>
              <Table.Td className={classes.cell}>
                <Cell value={row.business} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

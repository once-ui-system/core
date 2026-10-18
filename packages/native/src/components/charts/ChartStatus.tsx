import type { ReactNode } from "react";
import { Column } from "../Flex";
import { Spinner } from "../Spinner";
import { Text } from "../Text";

export interface ChartStatusProps {
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;
}

const message = (node: ReactNode, onBackground: "neutral-weak" | "danger-weak") =>
  typeof node === "string" || typeof node === "number" ? (
    <Text align="center" variant="label-default-s" onBackground={onBackground}>
      {node}
    </Text>
  ) : (
    node
  );

/** Core's `ChartStatus`: a spinner while loading, else the empty or error message. */
export function ChartStatus({
  loading = false,
  empty = false,
  error = false,
  emptyState = "No data available for the selected period",
  errorState = "An error occurred while fetching data",
}: ChartStatusProps) {
  if (!loading && !empty && !error) return null;
  return (
    <Column fill center padding="16">
      {loading ? (
        <Spinner size="m" />
      ) : empty ? (
        message(emptyState, "neutral-weak")
      ) : (
        message(errorState, "danger-weak")
      )}
    </Column>
  );
}

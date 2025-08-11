"use client";

import React from "react";
import { Column, Text, Spinner } from "../../components";

export interface ChartStatusProps {
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
}

export const ChartStatus: React.FC<ChartStatusProps> = ({
  loading = false,
  empty = false,
  error = false,
  emptyState = "No data available for the selected period",
  errorState = "An error occurred while fetching data",
}) => {
  if (!loading && !empty && !error) {
    return null;
  }

  return (
    <Column fill center>
      {loading ? (
        <Spinner size="m" />
      ) : empty ? (
        <Text align="center" variant="label-default-s" onBackground="neutral-weak">
          {emptyState}
        </Text>
      ) : (
        error && (
          <Text align="center" variant="label-default-s" onBackground="danger-weak">
            {errorState}
          </Text>
        )
      )}
    </Column>
  );
};

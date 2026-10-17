"use client";

import { Column, Pagination, Text } from "@once-ui-system/core";
import { useState } from "react";

const ARTICLES = 248;

export function PaginationControlledExample() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, ARTICLES);

  return (
    <Column gap="16" horizontal="center">
      <Text variant="body-default-s" onBackground="neutral-weak">
        Articles {first}–{last} of {ARTICLES}
      </Text>
      <Pagination
        page={page}
        onPageChange={setPage}
        count={ARTICLES}
        perPage={perPage}
        perPageOptions={[10, 20, 50]}
        onPerPageChange={setPerPage}
        size="s"
      />
    </Column>
  );
}

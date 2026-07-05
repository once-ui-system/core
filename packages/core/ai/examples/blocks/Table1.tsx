"use client";

import { Checkbox, Column, IconButton, Input, Row, Text, Card, Icon, DropdownWrapper, Button, ToggleButton, CountFx } from "@once-ui-system/core";
import { useEffect, useMemo, useState } from "react";

type Align = "start" | "center" | "end";

export type TableColumn<T = any> = {
  key: string;
  title: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  align?: Align;
  width?: number; // in grid columns (optional)
};

export type Table1Props<T = any> = React.ComponentProps<typeof Column> & {
  data: T[];
  columns: TableColumn<T>[];
  selectable?: boolean;
  getId?: (item: T, index: number) => string;
  itemsPerPageOptions?: number[];
  initialItemsPerPage?: number;
  heading?: React.ReactNode;
  showSearch?: boolean;
  filterFn?: (item: T, query: string) => boolean;
  onSelectionChange?: (ids: Set<string>) => void;
};

export const Table1: React.FC<Table1Props> = ({
  data,
  columns,
  selectable = false,
  getId,
  itemsPerPageOptions = [5, 25, 50, 100],
  initialItemsPerPage = 5,
  heading = "Items",
  showSearch = true,
  filterFn,
  onSelectionChange,
  ...flex
}) => {

  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState(new Set<string>());

  // Filter by search
  const filteredContent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    if (filterFn) return data.filter((item) => filterFn(item, q));
    // Default fallback filter: stringify
    return data.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [search, data, filterFn]);

  // Pagination calculations
  const totalitemsPerPage = Math.max(1, Math.ceil(filteredContent.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredContent.slice(startIndex, endIndex);

  // Reset to first page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  // Selection helpers
  const resolveId = (item: any, index: number) => (getId ? getId(item, index) : String(index));
  const isSelected = (id: string) => selectedItems.has(id);
  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      onSelectionChange?.(next);
      return next;
    });
  };

  const currentPageIds = paginatedItems.map((i, idx) => resolveId(i, startIndex + idx));
  const allCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedItems.has(id));
  const someCurrentSelected = currentPageIds.some((id) => selectedItems.has(id));
  const toggleSelectAllCurrent = () => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (allCurrentSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      onSelectionChange?.(next);
      return next;
    });
  };

  return (
    <Column fillWidth radius="l" border="neutral-alpha-weak" {...flex}>
      <Row fillWidth horizontal="between" paddingY="12" paddingRight="12" paddingLeft="24" gap="16" vertical="center" s={{direction: "column",}}>
        <Row fillWidth gap="12" vertical="center" horizontal="between">
          {selectable && someCurrentSelected ? (
            <CountFx variant="label-default-m" paddingY="12" paddingLeft="8" value={selectedItems.size} effect="smooth" speed={250}>
              <Text marginLeft="8">selected</Text>
            </CountFx>
          ) : (
            typeof heading === "string" ? (
              <Text variant="label-default-m" paddingY="12" paddingLeft="8">{heading}</Text>
            ) : (
              <Row paddingY="12" paddingLeft="8">{heading}</Row>
            )
          )}
        </Row>
        {showSearch && (
          <Row maxWidth={16}>
            <Input
              height="s"
              id="search"
              placeholder="Search..."
              value={search}
              hasPrefix={<Icon name="search" size="s" onBackground="neutral-weak"/>}
              hasSuffix={search.length > 0 && <IconButton tooltip="Clear" tooltipPosition="left" icon="close" size="s" variant="ghost" onClick={() => setSearch("")}/>}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Row>
        )}
      </Row>
      <Column fillWidth overflowX="auto">
        <Column fillWidth radius="l" border="neutral-alpha-weak" overflow="hidden">
          <Row fillWidth gap="16" paddingX="24" paddingY="12" borderBottom="neutral-alpha-weak">
            {selectable && (
              <Row textVariant="label-default-s" vertical="center" gap="16">
                <Checkbox
                  isChecked={allCurrentSelected || (someCurrentSelected && !allCurrentSelected)}
                  isIndeterminate={someCurrentSelected && !allCurrentSelected}
                  onToggle={toggleSelectAllCurrent}
                />
              </Row>
            )}
            {columns.map((col, cIdx) => (
              <Row
                key={`head-${col.key}-${cIdx}`}
                fillWidth
                minWidth={8}
                textVariant="label-default-s"
                vertical="center"
                horizontal={col.align === "end" ? "end" : col.align === "center" ? "center" : "start"}
                paddingRight={col.align === "end" ? "8" : undefined}
              >
                {col.title}
              </Row>
            ))}
          </Row> 
          <Column fillWidth overflow="auto">
            <Column fitWidth style={{minWidth: "100%"}}>
              {paginatedItems.map((item, index) => {
                const globalIndex = startIndex + index;
                const id = resolveId(item, globalIndex);
                return (
                  <Row key={`row-${id}`} gap="16" fillWidth borderBottom={index === paginatedItems.length - 1 ? "transparent" : "neutral-alpha-weak"}>
                    <Card fillWidth paddingY="8" paddingX="24" gap="16" vertical="center" border="transparent" background="transparent">
                      {selectable && (
                        <Row vertical="center" gap="16">
                          <Checkbox
                            key={`cb-${id}`}
                            isChecked={isSelected(id)}
                            onToggle={() => toggleSelect(id)}
                          />
                        </Row>
                      )}
                      {columns.map((col, cIdx) => (
                        <Row
                          key={`cell-${id}-${col.key}-${cIdx}`}
                          fillWidth
                          minWidth={8}
                          horizontal={col.align === "end" ? "end" : col.align === "center" ? "center" : "start"}
                          paddingRight={col.align === "end" ? "8" : undefined}
                        >
                          {col.render(item, globalIndex)}
                        </Row>
                      ))}
                    </Card>
                  </Row>
                );
              })}
            </Column>
            {paginatedItems.length === 0 && (
              <Column fill center padding="l" gap="24">
                <Text variant="label-default-s" onBackground="neutral-weak">No results{search ? ` for "${search}"` : ""}</Text>
                {showSearch && <Button size="s" variant="secondary" onClick={() => setSearch("")}>Clear search</Button>}
              </Column>
            )}
          </Column>
        </Column>
      </Column>

      <Row fillWidth horizontal="between" vertical="center" paddingX="24">
        <Row fillWidth paddingY="12" gap="12" vertical="center">
          <IconButton icon="chevronLeft" size="s" variant="ghost" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}/>
          <Row gap="4" vertical="center">
            {/* Page 1 */}
            <IconButton
              key={`page-1`}
              size="m"
              variant={currentPage === 1 ? "primary" : "secondary"}
              onClick={() => setCurrentPage(1)}
            >
              <Text variant="label-strong-s">1</Text>
            </IconButton>

            {/* Page 2 (if exists) */}
            {totalitemsPerPage >= 2 && (
              <IconButton
                key={`page-2`}
                size="m"
                variant={currentPage === 2 ? "primary" : "secondary"}
                onClick={() => setCurrentPage(2)}
              >
                <Text variant="label-strong-s">2</Text>
              </IconButton>
            )}

            {/* More dropdown for middle pages when > 4 total pages */}
            {totalitemsPerPage > 4 && (
              <DropdownWrapper
                placement="bottom-end"
                trigger={<IconButton icon="moreHorizontal" size="s" variant="ghost"/>}
                dropdown={
                  <Column padding="4" gap="2" width={4}>
                    {Array.from({ length: totalitemsPerPage - 4 }, (_, i) => i + 3).map((pageNum) => (
                      <ToggleButton
                        key={`page-middle-${pageNum}`}
                        fillWidth
                        horizontal="start"
                        selected={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </ToggleButton>
                    ))}
                  </Column>
                }
              />
            )}

            {/* Last-1 and Last */}
            {totalitemsPerPage >= 4 ? (
              <>
                <IconButton
                  key={`page-${totalitemsPerPage - 1}`}
                  size="m"
                  variant={currentPage === totalitemsPerPage - 1 ? "primary" : "secondary"}
                  onClick={() => setCurrentPage(totalitemsPerPage - 1)}
                >
                  <Text variant="label-strong-s">{totalitemsPerPage - 1}</Text>
                </IconButton>
                <IconButton
                  key={`page-${totalitemsPerPage}`}
                  size="m"
                  variant={currentPage === totalitemsPerPage ? "primary" : "secondary"}
                  onClick={() => setCurrentPage(totalitemsPerPage)}
                >
                  <Text variant="label-strong-s">{totalitemsPerPage}</Text>
                </IconButton>
              </>
            ) : totalitemsPerPage === 3 ? (
              <IconButton
                key={`page-3`}
                size="m"
                variant={currentPage === 3 ? "primary" : "secondary"}
                onClick={() => setCurrentPage(3)}
              >
                <Text variant="label-strong-s">3</Text>
              </IconButton>
            ) : null}
          </Row>
          <IconButton icon="chevronRight" size="s" variant="ghost" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalitemsPerPage}/>
        </Row>

        <DropdownWrapper
          placement="bottom-end"
          trigger={
            <Button size="s" variant="secondary" prefixIcon="chevronDown">
              <Text variant="label-strong-s">{itemsPerPage}</Text>
            </Button>
          }
          dropdown={
            <Column padding="4" gap="2" width={4}>
              {itemsPerPageOptions.map((option) => (
                <ToggleButton
                  key={option}
                  fillWidth
                  horizontal="start"
                  onClick={() => setItemsPerPage(option)}
                >
                  {option}
                </ToggleButton>
              ))}
            </Column>
          }
        />
      </Row>
    </Column>
  );
};
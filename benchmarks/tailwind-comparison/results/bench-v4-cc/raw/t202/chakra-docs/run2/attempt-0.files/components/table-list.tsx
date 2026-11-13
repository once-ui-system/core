"use client";

import { Badge, Box, chakra, Flex, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { Panel } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { partyPalette, rsvpLabel, tables } from "@/lib/data";
import { guestById } from "@/lib/plan";

/** The same plan as a list: easier to read and tap on a phone. */
export function TableList() {
  const {
    occ,
    brokenTables,
    brokenGuests,
    selectedTableId,
    selectedGuestId,
    activeGuestId,
    dropTarget,
    activateTable,
    activateSeat,
    beginPress,
    consumeClick,
  } = usePlan();

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" p="3">
      {tables.map((t) => {
        const row = occ[t.id];
        const filled = row.filter(Boolean).length;
        const broken = brokenTables.has(t.id);
        const selected = selectedTableId === t.id;
        const hovered = dropTarget === `table:${t.id}` || (dropTarget?.startsWith(`seat:${t.id}:`) ?? false);
        const candidate = !!activeGuestId && filled < t.seats;
        return (
          <Panel
            key={t.id}
            data-table={t.id}
            borderWidth={selected || hovered ? "2px" : "1px"}
            borderColor={hovered ? "teal.solid" : broken ? "red.solid" : selected ? "fg" : candidate ? "teal.muted" : "border.muted"}
            borderStyle={candidate && !selected && !hovered ? "dashed" : "solid"}
            overflow="hidden"
          >
            <chakra.button
              type="button"
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="2"
              px="3"
              py="2.5"
              bg={broken ? "red.subtle" : "bg.muted"}
              textAlign="start"
              onClick={() => activateTable(t.id)}
              aria-pressed={selected}
              aria-label={`${t.name}, ${filled} of ${t.seats} seats filled${broken ? ", a rule is broken" : ""}${activeGuestId ? ". Place the selected guest here" : ""}`}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "-2px" }}
            >
              <Text fontWeight="bold">{t.name}</Text>
              <HStack gap="2">
                {broken ? (
                  <Badge colorPalette="red" variant="solid" gap="1">
                    <LuTriangleAlert aria-hidden /> Rule
                  </Badge>
                ) : null}
                <Badge colorPalette={filled === t.seats ? "green" : "gray"} variant="subtle">
                  {filled}/{t.seats}
                </Badge>
              </HStack>
            </chakra.button>
            <Box p="2">
              {row.map((gid, i) => {
                const g = gid ? guestById.get(gid) : undefined;
                const key = `${t.id}:${i}`;
                const pal = g ? (partyPalette[g.party] ?? "gray") : "gray";
                const flagged = !!gid && brokenGuests.has(gid);
                return (
                  <Flex
                    key={key}
                    data-seat={key}
                    role="button"
                    tabIndex={0}
                    aria-label={g ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}` : `${t.name}, seat ${i + 1}: empty`}
                    aria-pressed={g ? selectedGuestId === gid : undefined}
                    align="center"
                    gap="2"
                    px="2"
                    py="1.5"
                    rounded="md"
                    fontSize="sm"
                    cursor={g ? "grab" : "pointer"}
                    userSelect="none"
                    borderWidth="1px"
                    borderColor={dropTarget === `seat:${key}` ? "teal.solid" : selectedGuestId === gid && gid ? "fg" : flagged ? "red.solid" : "transparent"}
                    style={{ touchAction: g ? "none" : "auto" }}
                    onPointerDown={g && gid ? (e) => beginPress(e, gid) : undefined}
                    onClick={() => {
                      if (consumeClick()) return;
                      activateSeat(t.id, i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        activateSeat(t.id, i);
                      }
                    }}
                    _hover={{ bg: "bg.muted" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid" }}
                  >
                    <Text as="span" w="5" textAlign="end" color="fg.muted" fontVariantNumeric="tabular-nums">
                      {i + 1}
                    </Text>
                    {g ? (
                      <>
                        <Box boxSize="2.5" rounded="full" bg={`${pal}.solid`} flexShrink={0} aria-hidden />
                        <Text as="span" flex="1" minW="0" fontWeight="medium" truncate>
                          {g.name}
                        </Text>
                        {g.rsvp !== "yes" ? (
                          <Badge size="xs" colorPalette="orange" variant="subtle">
                            {rsvpLabel[g.rsvp]}
                          </Badge>
                        ) : null}
                        {g.diet ? (
                          <Badge size="xs" colorPalette="yellow" variant="subtle">
                            {g.diet}
                          </Badge>
                        ) : null}
                      </>
                    ) : (
                      <Text as="span" color="fg.subtle" fontStyle="italic">
                        {activeGuestId ? "Empty: tap to place here" : "Empty seat"}
                      </Text>
                    )}
                  </Flex>
                );
              })}
            </Box>
          </Panel>
        );
      })}
    </SimpleGrid>
  );
}

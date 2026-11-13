"use client";

import { Badge, Box, Button, chakra, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuTriangleAlert, LuX } from "react-icons/lu";
import { GuestChip } from "@/components/guest-chip";
import { Panel, PanelHeader } from "@/components/panel";
import { usePlan } from "@/components/plan-provider";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { partyPalette, rsvpLabel, rsvpPalette, tables } from "@/lib/data";
import { guestById, tableById, type RuleResult } from "@/lib/plan";

const STATUS_LABEL = { ok: "Fine", broken: "Broken", open: "Waiting" } as const;
const STATUS_PALETTE = { ok: "green", broken: "red", open: "gray" } as const;

function RuleLine({ r }: { r: RuleResult }) {
  const { seating, selectTable } = usePlan();
  const jump = r.tableIds[0] ?? (r.guestIds[0] ? seating[r.guestIds[0]]?.table : undefined);
  const body = (
    <Flex gap="3" align="flex-start" textAlign="start" w="full">
      <Box mt="0.5" color={`${STATUS_PALETTE[r.status]}.fg`} flexShrink={0} aria-hidden>
        {r.status === "broken" ? <LuTriangleAlert /> : r.status === "ok" ? <LuCircleCheck /> : <Box boxSize="3.5" rounded="full" borderWidth="2px" borderStyle="dashed" borderColor="border.emphasized" />}
      </Box>
      <Box flex="1" minW="0">
        <HStack justify="space-between" align="flex-start" gap="2">
          <Text fontSize="sm" fontWeight="semibold">
            {r.title}
          </Text>
          <Badge size="xs" colorPalette={STATUS_PALETTE[r.status]} variant={r.status === "broken" ? "solid" : "subtle"} flexShrink={0}>
            {STATUS_LABEL[r.status]}
          </Badge>
        </HStack>
        <Text fontSize="xs" color="fg.muted" mt="0.5">
          {r.detail}
        </Text>
        <Text fontSize="xs" color="fg.subtle" mt="0.5">
          Couple's note: {r.rule.note}
        </Text>
        {r.rule.caveat ? (
          <Text fontSize="xs" color="orange.fg" mt="1">
            Check: {r.rule.caveat}
          </Text>
        ) : null}
      </Box>
    </Flex>
  );
  if (!jump) return <Box px="4" py="3">{body}</Box>;
  return (
    <chakra.button
      type="button"
      w="full"
      px="4"
      py="3"
      cursor="pointer"
      _hover={{ bg: "bg.muted" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid", outlineOffset: "-2px" }}
      onClick={() => selectTable(jump)}
      aria-label={`${r.title}. ${STATUS_LABEL[r.status]}. ${r.detail} Show ${tableById.get(jump)?.name}.`}
    >
      {body}
    </chakra.button>
  );
}

export function RulesCard() {
  const { results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const ok = results.filter((r) => r.status === "ok").length;
  const open = results.length - broken - ok;
  const ordered = [...results].sort((a, b) => {
    const rank = { broken: 0, open: 1, ok: 2 } as const;
    return rank[a.status] - rank[b.status];
  });
  return (
    <Panel as="section" aria-labelledby="rules-h">
      <PanelHeader title="The couple's rules" id="rules-h">
        <HStack gap="1.5" aria-live="polite">
          {broken ? (
            <Badge colorPalette="red" variant="solid">
              {broken} broken
            </Badge>
          ) : (
            <Badge colorPalette="green" variant="subtle">
              None broken
            </Badge>
          )}
          {open ? (
            <Badge colorPalette="gray" variant="subtle">
              {open} waiting
            </Badge>
          ) : null}
          <Badge colorPalette="green" variant="subtle">
            {ok} fine
          </Badge>
        </HStack>
      </PanelHeader>
      <Stack gap="0" separator={<Box borderTopWidth="1px" borderColor="border.muted" />}>
        {ordered.map((r) => (
          <RuleLine key={r.id} r={r} />
        ))}
      </Stack>
    </Panel>
  );
}

function GuestPanel({ id }: { id: string }) {
  const { seating, occ, results, unseat, placeGuest, selectGuest, selectTable } = usePlan();
  const g = guestById.get(id);
  if (!g) return null;
  const s = seating[id];
  const pal = partyPalette[g.party] ?? "gray";
  const options = tables
    .filter((t) => t.id !== s?.table && occ[t.id].some((x) => x === null))
    .map((t) => ({ value: t.id, label: `${t.name} (${occ[t.id].filter((x) => x === null).length} free)` }));
  const related = results.filter((r) => r.rule.guests.includes(id));
  return (
    <Stack gap="3" p="4">
      <Flex justify="space-between" align="flex-start" gap="3">
        <Box minW="0">
          <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            Selected guest
          </Text>
          <Text fontSize="lg" fontWeight="bold" lineHeight="short">
            {g.name}
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => selectGuest(null)} aria-label="Clear selection">
          <LuX />
        </Button>
      </Flex>
      <HStack wrap="wrap" gap="1.5">
        <Badge colorPalette={pal} variant="subtle">
          {g.party}
        </Badge>
        <Badge colorPalette={rsvpPalette[g.rsvp]} variant="subtle">
          {rsvpLabel[g.rsvp]}
        </Badge>
        {g.diet ? (
          <Badge colorPalette="yellow" variant="subtle">
            {g.diet}
          </Badge>
        ) : (
          <Badge colorPalette="gray" variant="outline">
            No dietary needs
          </Badge>
        )}
      </HStack>
      <Text fontSize="sm" color="fg.muted">
        {s
          ? `Sitting at ${tableById.get(s.table)?.name}, seat ${s.seat + 1}.`
          : "Not seated yet. Tap a table or an empty seat on the plan, or drag them there."}
      </Text>
      {g.rsvp === "no" ? (
        <Text fontSize="sm" color="red.fg">
          Declined, so this guest cannot be seated.
        </Text>
      ) : (
        <NativeSelectRoot size="sm">
          <NativeSelectField
            aria-label={s ? "Move to another table" : "Seat at a table"}
            value=""
            onChange={(e) => {
              if (e.target.value) placeGuest(id, e.target.value);
            }}
            items={[{ value: "", label: s ? "Move to another table..." : "Seat at a table..." }, ...options]}
          />
        </NativeSelectRoot>
      )}
      {related.length ? (
        <Stack gap="1">
          {related.map((r) => (
            <HStack key={r.id} gap="2" align="flex-start" fontSize="xs" color={r.status === "broken" ? "red.fg" : "fg.muted"}>
              <Box mt="0.5" aria-hidden>
                {r.status === "broken" ? <LuTriangleAlert /> : <LuCircleCheck />}
              </Box>
              <Text>
                {r.title}: {r.detail}
              </Text>
            </HStack>
          ))}
        </Stack>
      ) : null}
      <HStack gap="2">
        {s ? (
          <Button size="sm" variant="outline" colorPalette="red" onClick={() => unseat(id)}>
            Unseat
          </Button>
        ) : null}
        {s ? (
          <Button size="sm" variant="ghost" onClick={() => selectTable(s.table)}>
            Show table
          </Button>
        ) : null}
      </HStack>
    </Stack>
  );
}

function TablePanel({ id }: { id: string }) {
  const { occ, results, selectGuest, selectTable, activeGuestId, placeGuest } = usePlan();
  const t = tableById.get(id);
  if (!t) return null;
  const row = occ[id];
  const filled = row.filter(Boolean).length;
  const diets = new Map<string, number>();
  for (const gid of row) {
    const d = gid ? guestById.get(gid)?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const broken = results.filter((r) => r.status === "broken" && r.tableIds.includes(id));
  return (
    <Stack gap="3" p="4">
      <Flex justify="space-between" align="flex-start" gap="3">
        <Box minW="0">
          <Text fontSize="xs" color="fg.muted" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
            Selected table
          </Text>
          <Text fontSize="lg" fontWeight="bold" lineHeight="short">
            {t.name}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {filled} of {t.seats} seats filled, {t.seats - filled} free
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => selectTable(null)} aria-label="Clear selection">
          <LuX />
        </Button>
      </Flex>

      {broken.map((r) => (
        <HStack key={r.id} gap="2" align="flex-start" p="2.5" rounded="md" bg="red.subtle" color="red.fg" fontSize="xs">
          <Box mt="0.5" aria-hidden>
            <LuTriangleAlert />
          </Box>
          <Text>
            <b>{r.title}.</b> {r.detail}
          </Text>
        </HStack>
      ))}

      <Stack gap="1">
        {row.map((gid, i) => {
          const g = gid ? guestById.get(gid) : undefined;
          if (!g) {
            return (
              <chakra.button
                key={`e-${i}`}
                type="button"
                display="flex"
                alignItems="center"
                gap="2"
                px="2.5"
                py="1.5"
                rounded="md"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="border.emphasized"
                color="fg.muted"
                fontSize="sm"
                textAlign="start"
                disabled={!activeGuestId}
                cursor={activeGuestId ? "pointer" : "default"}
                _hover={activeGuestId ? { bg: "teal.subtle", borderColor: "teal.solid" } : undefined}
                onClick={() => activeGuestId && placeGuest(activeGuestId, id, i)}
              >
                <Text as="span" w="5" textAlign="end" fontVariantNumeric="tabular-nums">
                  {i + 1}
                </Text>
                {activeGuestId ? "Empty: place the selected guest here" : "Empty seat"}
              </chakra.button>
            );
          }
          const pal = partyPalette[g.party] ?? "gray";
          return (
            <chakra.button
              key={gid}
              type="button"
              display="flex"
              alignItems="center"
              gap="2"
              px="2.5"
              py="1.5"
              rounded="md"
              bg="bg.muted"
              textAlign="start"
              fontSize="sm"
              onClick={() => selectGuest(g.id)}
              _hover={{ bg: "bg.emphasized" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid" }}
            >
              <Text as="span" w="5" textAlign="end" color="fg.muted" fontVariantNumeric="tabular-nums">
                {i + 1}
              </Text>
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
            </chakra.button>
          );
        })}
      </Stack>

      <Box>
        <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb="1.5">
          Dietary needs at this table
        </Text>
        {diets.size ? (
          <HStack wrap="wrap" gap="1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <Badge key={d} colorPalette="yellow" variant="subtle">
                {n} x {d}
              </Badge>
            ))}
          </HStack>
        ) : (
          <Text fontSize="sm" color="fg.muted">
            None noted.
          </Text>
        )}
      </Box>
    </Stack>
  );
}

export function SelectionCard() {
  const { selectedGuestId, selectedTableId } = usePlan();
  return (
    <Panel as="section" aria-label="Selection">
      {selectedGuestId ? (
        <GuestPanel id={selectedGuestId} />
      ) : selectedTableId ? (
        <TablePanel id={selectedTableId} />
      ) : (
        <Stack gap="1" p="4">
          <Text fontWeight="semibold">Nothing selected</Text>
          <Text fontSize="sm" color="fg.muted">
            Select a table to see its guests and their dietary needs. Select a guest, then tap a table or an empty seat, or drag them across.
          </Text>
        </Stack>
      )}
    </Panel>
  );
}

export function ToPlaceCard() {
  const { toPlace, undecidedUnseated, dropTarget, activeGuestId, seating } = usePlan();
  const over = dropTarget === "unseat";
  const canUnseatByDrop = !!activeGuestId && !!seating[activeGuestId];
  return (
    <Panel
      as="section"
      aria-labelledby="toplace-h"
      data-unseat-zone=""
      borderColor={over ? "teal.solid" : canUnseatByDrop ? "teal.muted" : "border.muted"}
      borderStyle={canUnseatByDrop ? "dashed" : "solid"}
      bg={over ? "teal.subtle" : "bg.panel"}
    >
      <PanelHeader title="Guests to place" id="toplace-h">
        <Badge colorPalette={toPlace.length ? "orange" : "green"} variant="subtle">
          {toPlace.length ? `${toPlace.length} without a seat` : "All seated"}
        </Badge>
      </PanelHeader>
      <Stack gap="2" p="3">
        {canUnseatByDrop ? (
          <Text fontSize="xs" color="teal.fg" fontWeight="medium">
            Drop here to unseat
          </Text>
        ) : null}
        {toPlace.length === 0 ? (
          <HStack gap="2" color="green.fg" fontSize="sm" p="2">
            <LuCircleCheck aria-hidden />
            <Text>Everyone attending has a seat.</Text>
          </HStack>
        ) : (
          toPlace.map((g) => <GuestChip key={g.id} guest={g} />)
        )}
        {undecidedUnseated.length ? (
          <>
            <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mt="2">
              Not confirmed yet
            </Text>
            {undecidedUnseated.map((g) => (
              <GuestChip key={g.id} guest={g} />
            ))}
          </>
        ) : null}
      </Stack>
    </Panel>
  );
}

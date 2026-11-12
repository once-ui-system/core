"use client";

/**
 * Gold example: a map app, built to ship.
 * Target: the map is the screen. It is full-bleed, with floating panels over
 * it for the list and the selected item, the brand mark in the corner, and
 * every state a real backend produces: loading, empty (also when a filter
 * hides everything), error with retry, and a failed write that rolls back.
 *
 * The data layer sits at the top, in what would be `lib/jobs.ts`: typed async
 * functions over mock data with a delay. The screen calls only these, so a
 * real API replaces their bodies and nothing else changes.
 */
import {
  Button,
  Card,
  Column,
  Feedback,
  Logo,
  Row,
  SegmentedControl,
  Skeleton,
  Tag,
  Text,
  Timeline,
  useToast,
} from "@once-ui-system/core";
import {
  type LngLat,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: the component's own name
  Map,
  MapCircle,
  MapMarkers,
  MapPin,
} from "@once-ui-system/core/map";
import { useCallback, useEffect, useState } from "react";

// ── lib/jobs.ts ──────────────────────────────────────────────────────────

export type JobStatus = "open" | "assigned" | "late";
export type Job = {
  id: string;
  title: string;
  address: string;
  position: LngLat;
  status: JobStatus;
  /** What kind of job: the pin's icon (its status is the pin's tone). */
  kind: "home" | "bolt";
  /** Metres round the address the job may be anywhere in. */
  radius: number;
  history: { label: string; at: string }[];
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const seed: Job[] = [
  {
    id: "j1",
    title: "Boiler service",
    address: "Andrássy út 12",
    position: [19.0583, 47.5025],
    status: "open",
    kind: "home",
    radius: 150,
    history: [{ label: "Reported", at: "08:10" }],
  },
  {
    id: "j2",
    title: "Lift inspection",
    address: "Váci utca 40",
    position: [19.0526, 47.4927],
    status: "late",
    kind: "bolt",
    radius: 120,
    history: [
      { label: "Reported", at: "07:20" },
      { label: "Due", at: "09:00" },
    ],
  },
];

export const jobs = {
  async list(): Promise<Job[]> {
    await wait(500);
    return seed;
  },
  /** Rejects when the server refuses, so the screen can roll back. */
  async assign(id: string): Promise<Job> {
    await wait(700);
    const job = seed.find((j) => j.id === id);
    if (!job) throw new Error("Not found");
    return { ...job, status: "assigned" };
  },
};

// ── the screen ───────────────────────────────────────────────────────────

const STATUS: Record<JobStatus, { label: string; tone: "brand" | "success" | "danger" }> = {
  open: { label: "Open", tone: "brand" },
  assigned: { label: "Assigned", tone: "success" },
  late: { label: "Late", tone: "danger" },
};

type Filter = "all" | JobStatus;

export function MapAppExample() {
  const { addToast } = useToast();
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [items, setItems] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setState("loading");
    jobs
      .list()
      .then((data) => {
        setItems(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);

  const shown = items.filter((j) => filter === "all" || j.status === filter);
  const selected = items.find((j) => j.id === selectedId);

  // Optimistic: the job turns assigned at once and goes back if the server refuses.
  const assign = async (job: Job) => {
    setSaving(true);
    setItems((list) => list.map((j) => (j.id === job.id ? { ...j, status: "assigned" } : j)));
    try {
      await jobs.assign(job.id);
    } catch {
      setItems((list) => list.map((j) => (j.id === job.id ? job : j)));
      addToast({ tone: "danger", message: `Couldn't assign ${job.title}. Try again.` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Column fill height="100dvh">
      <Map
        fill
        bounds={shown.map((j) => j.position)}
        defaultViewport={{ center: [19.0402, 47.4979], zoom: 12 }}
      >
        <MapMarkers
          items={shown}
          activeId={selectedId ?? undefined}
          cluster
          renderItem={(job) => (
            // Type as the icon, status as the tone, both at rest; the name only when selected.
            <MapPin
              icon={job.kind}
              tone={STATUS[job.status].tone}
              active={job.id === selectedId}
              onClick={() => setSelectedId(job.id)}
              aria-label={`${job.title}, ${STATUS[job.status].label}`}
            >
              {job.id === selectedId ? job.title : undefined}
            </MapPin>
          )}
        />
        {selected && (
          <MapCircle
            position={selected.position}
            radius={selected.radius}
            tone={STATUS[selected.status].tone}
          />
        )}
      </Map>

      {/* The list floats over the map; on a phone it becomes the bottom sheet. */}
      <Column
        position="absolute"
        top="16"
        left="16"
        width={22}
        maxHeight="calc(100% - 2rem)"
        background="surface"
        border
        radius="l"
        shadow="l"
        overflow="hidden"
        s={{ position: "absolute", top: undefined, bottom: "0", left: "0", width: "100%" }}
      >
        <Row padding="16" gap="12" vertical="center" horizontal="between" borderBottom>
          <Logo text="Fjell Service" monogram="F" size="s" />
          <Tag label={`${items.filter((j) => j.status === "late").length} late`} tone="danger" />
        </Row>
        <Column padding="12" borderBottom>
          <SegmentedControl
            compact
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
            buttons={[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "late", label: "Late" },
            ]}
          />
        </Column>
        <Column overflowY="auto" padding="8" gap="4">
          {state === "loading" &&
            [0, 1, 2].map((i) => <Skeleton key={i} shape="block" height={56} />)}
          {state === "error" && (
            <Feedback tone="danger" title="Jobs didn't load">
              <Button size="s" variant="secondary" label="Retry" onClick={load} />
            </Feedback>
          )}
          {state === "ready" && shown.length === 0 && (
            <Column padding="16" gap="8" horizontal="center">
              <Text textVariant="label-strong-m">
                {items.length === 0 ? "No jobs today" : "Nothing matches"}
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
                {items.length === 0
                  ? "New jobs appear here as they come in."
                  : "Try another filter."}
              </Text>
              {items.length > 0 && (
                <Button
                  size="s"
                  variant="secondary"
                  label="Show all"
                  onClick={() => setFilter("all")}
                />
              )}
            </Column>
          )}
          {state === "ready" &&
            shown.map((job) => (
              <Card
                key={job.id}
                selected={job.id === selectedId}
                fillWidth
                padding="12"
                radius="m"
                gap="12"
                vertical="center"
                horizontal="between"
                onClick={() => setSelectedId(job.id)}
              >
                <Column>
                  <Text textVariant="label-strong-s">{job.title}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {job.address}
                  </Text>
                </Column>
                <Tag size="s" label={STATUS[job.status].label} tone={STATUS[job.status].tone} />
              </Card>
            ))}
        </Column>
      </Column>

      {selected && (
        <Column
          position="absolute"
          top="16"
          right="16"
          width={20}
          background="surface"
          border
          radius="l"
          shadow="l"
          padding="20"
          gap="16"
          s={{ hide: true }}
        >
          <Column gap="4">
            <Text textVariant="heading-strong-s">{selected.title}</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {selected.address}
            </Text>
          </Column>
          <Timeline
            size="xs"
            items={selected.history.map((h) => ({
              label: h.label,
              description: h.at,
              tone: "brand",
            }))}
          />
          <Button
            label={selected.status === "assigned" ? "Assigned" : "Assign to me"}
            disabled={selected.status === "assigned"}
            loading={saving}
            onClick={() => assign(selected)}
          />
        </Column>
      )}
    </Column>
  );
}

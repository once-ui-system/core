```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";
import { ClinicProvider } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Pawpoint · Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <ClinicProvider>
            <AppShell>{children}</AppShell>
          </ClinicProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/Schedule";

export default function Page() {
  return <Schedule />;
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return <PatientRecord id={id} />;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack (mirrors the official Next.js starter):
// theme, Next-aware links/images, chart theme, toasts, icons.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      brand="custom"
      brandSeed="#0F766E"
      accent="cyan"
      neutral="slate"
      solid="color"
      border="rounded"
      density="spacious"
      defaultTheme="light">
      <LayoutProvider>
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
```

```tsx components/AlertTags.tsx
"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";

/** One medical alert, drawn so it cannot be mistaken for ordinary metadata. */
export function AlertChip({ text, size = "s" }: { text: string; size?: "s" | "m" }) {
  return (
    <Row
      background="danger-alpha-weak"
      border="danger-alpha-medium"
      radius="s"
      paddingX="8"
      paddingY="4"
      gap="4"
      vertical="center"
      fit
      onBackground="danger-strong">
      <Icon name="warning" size="xs" onBackground="danger-strong" />
      <Text textVariant={size === "m" ? "label-strong-m" : "label-strong-s"} onBackground="danger-strong">
        {text}
      </Text>
    </Row>
  );
}

export function AlertChips({ alerts, size = "s" }: { alerts: string[]; size?: "s" | "m" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <div key={a} role="listitem">
          <AlertChip text={a} size={size} />
        </div>
      ))}
    </Row>
  );
}

/** Full-width banner used at the top of a record and in the booking dialog. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row
      role="alert"
      background="danger-alpha-weak"
      border="danger-alpha-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="16"
      vertical="start">
      <Icon name="warning" size="l" onBackground="danger-strong" />
      <Column gap="8" flex={1}>
        <Text textVariant="label-strong-s" onBackground="danger-strong">
          {`MEDICAL ALERT${alerts.length > 1 ? "S" : ""} FOR ${name.toUpperCase()}`}
        </Text>
        <Column gap="4" as="ul">
          {alerts.map((a) => (
            <Text as="li" key={a} textVariant="heading-strong-m" onBackground="danger-strong">
              {a}
            </Text>
          ))}
        </Column>
      </Column>
    </Row>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbar,
  Kbd,
  Nav,
  NavGroup,
  NavItem,
  Row,
  Text,
  VisuallyHidden,
  selectNavHref,
  type KbarItem,
} from "@once-ui-system/core";
import { BookingDialog } from "./BookingDialog";
import { useClinic } from "@/lib/clinic";
import { CLINIC, PRODUCT, USER, getOwner, patients } from "@/lib/data";

function SideNav({ pathname }: { pathname: string }) {
  const hrefs = ["/", ...patients.map((p) => `/patients/${p.id}`)];
  const current = selectNavHref(pathname, hrefs);
  const onPatient = current?.startsWith("/patients/") ?? false;
  return (
    <Nav fill paddingX="8" paddingY="8" aria-label="Main" density="normal">
      <NavItem href="/" icon="calendar" label="Today's schedule" selected={current === "/"} />
      <NavGroup label="Patients" icon="paw" defaultOpen={onPatient}>
        {patients.map((p) => (
          <NavItem
            key={p.id}
            href={`/patients/${p.id}`}
            label={p.name}
            selected={current === `/patients/${p.id}`}
            badge={
              p.alerts.length > 0 ? (
                <Icon name="warning" size="xs" onBackground="danger-strong" tooltip="Has medical alerts" />
              ) : undefined
            }
          />
        ))}
      </NavGroup>
    </Nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openBooking } = useClinic();
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const items = useMemo<KbarItem[]>(() => {
    const out: KbarItem[] = [];
    for (const p of patients) {
      const owner = getOwner(p.owner);
      out.push({
        id: `patient-${p.id}`,
        name: p.name,
        section: "Patients",
        keywords: `${p.species} ${p.breed} ${owner?.name ?? ""}`,
        icon: "paw",
        description: (
          <span>
            {p.species}, {p.breed} · {owner?.name}
            {p.alerts.length > 0 ? ` · ALERT: ${p.alerts.join("; ")}` : ""}
          </span>
        ),
        perform: () => router.push(`/patients/${p.id}`),
      });
      if (owner) {
        out.push({
          id: `owner-${owner.id}-${p.id}`,
          name: owner.name,
          section: "Owners",
          keywords: `${p.name} ${owner.phone}`,
          icon: "person",
          description: (
            <span>
              Owner of {p.name}
              {p.alerts.length > 0 ? ` · ALERT: ${p.alerts.join("; ")}` : ""}
            </span>
          ),
          perform: () => router.push(`/patients/${p.id}`),
        });
      }
    }
    return out;
  }, [router]);

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row height="56" fillWidth vertical="center" paddingX="16" gap="8" as="header">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row gap="8" vertical="center" fit>
          <Row
            width="32"
            height="32"
            radius="m"
            background="brand-alpha-weak"
            center
            aria-hidden="true">
            <Icon name="paw" size="s" onBackground="brand-strong" />
          </Row>
          <Column gap="0" s={{ hide: true }}>
            <Text textVariant="label-strong-m">{PRODUCT}</Text>
          </Column>
          <Column gap="0" m={{ hide: true }} s={{ hide: true }}>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {CLINIC}
            </Text>
          </Column>
        </Row>
        <Row flex={1} horizontal="center" paddingX="8">
          <Row maxWidth="28rem" fillWidth s={{ hide: true }}>
            <Button
              variant="secondary"
              fillWidth
              horizontal="between"
              prefixIcon="search"
              onClick={() => setSearchOpen(true)}>
              <Row gap="12" vertical="center" fillWidth horizontal="between">
                <Text onBackground="neutral-weak" textVariant="label-default-s">
                  Search patients or owners
                </Text>
                <Kbd keys="mod+k" />
              </Row>
            </Button>
          </Row>
          <Row hide s={{ hide: false }} horizontal="end" fillWidth>
            <IconButton
              icon="search"
              variant="secondary"
              tooltip="Search"
              aria-label="Search patients or owners"
              onClick={() => setSearchOpen(true)}
            />
          </Row>
        </Row>
        <Row s={{ hide: true }} fit>
          <Button prefixIcon="plus" onClick={() => openBooking()}>
            Book appointment
          </Button>
        </Row>
        <Row hide s={{ hide: false }} fit>
          <IconButton icon="plus" aria-label="Book appointment" tooltip="Book" onClick={() => openBooking()} />
        </Row>
        <Row gap="8" vertical="center" paddingLeft="8" fit>
          <Avatar value={USER.initials} size="s" />
          <Column gap="0" m={{ hide: true }} s={{ hide: true }}>
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
        </Row>
      </Row>
      <Row fill paddingX="8">
        <Column s={{ hide: true }} width="16rem" fitHeight position="sticky" top="56">
          <SideNav pathname={pathname} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            id="main"
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface">
            <Column
              maxWidth="xl"
              fillWidth
              gap="24"
              paddingY="32"
              paddingX="24"
              s={{ paddingX: "12", paddingY: "16" }}
              fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
      <Kbar items={items} open={searchOpen} onOpenChange={setSearchOpen} placeholder="Search a patient or an owner" />
      <BookingDialog />
    </Column>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Column, Dialog, Input, Row, Select, Text, useToast } from "@once-ui-system/core";
import { AlertBanner } from "./AlertTags";
import { useClinic } from "@/lib/clinic";
import { SLOTS, endTime, findClash, getOwner, getPatient, getVet, patients, toMin, vets } from "@/lib/data";

const DURATIONS = ["15", "20", "30", "45", "60"];

export function BookingDialog() {
  const { bookingOpen, bookingPatient, closeBooking, appointments, book, now } = useClinic();
  const { addToast } = useToast();
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [start, setStart] = useState("");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [tried, setTried] = useState(false);

  // A fresh form each time the dialog opens, with the patient preselected when we know them.
  useEffect(() => {
    if (bookingOpen) {
      setPatient(bookingPatient ?? "");
      setVet("");
      setMinutes("20");
      setStart("");
      setReason("");
      setUrgent(false);
      setTried(false);
    }
  }, [bookingOpen, bookingPatient]);

  const dur = Number(minutes);
  const chosen = getPatient(patient);

  const slotOptions = useMemo(
    () =>
      SLOTS.map((s) => {
        const past = toMin(s) < toMin(now);
        const clash = vet ? findClash(appointments, vet, s, dur) : undefined;
        const disabled = past || Boolean(clash);
        return {
          value: s,
          label: `${s} – ${endTime({ start: s, minutes: dur })}`,
          disabled,
          description: past ? "Already passed" : clash ? "Taken" : undefined,
        };
      }),
    [appointments, vet, dur, now],
  );

  const clash = vet && start ? findClash(appointments, vet, start, dur) : undefined;
  const startError = tried && !start ? "Pick a time" : clash ? "That time overlaps another booking for this vet." : undefined;

  function submit() {
    setTried(true);
    if (!patient || !vet || !start || !reason.trim() || clash) return;
    const res = book({ patient, vet, start, minutes: dur, reason, urgent });
    if (res.ok) {
      const p = getPatient(patient);
      addToast({
        variant: "success",
        message: `Booked ${p?.name} with ${getVet(vet)?.name} at ${start}.`,
      });
      closeBooking();
    } else {
      addToast({ variant: "danger", message: res.error });
    }
  }

  return (
    <Dialog
      open={bookingOpen}
      onClose={closeBooking}
      title="Book an appointment"
      description="Today, Thursday 12 November. Times that clash with the vet's other bookings are not offered."
      footer={
        <Row gap="8" horizontal="end" fillWidth>
          <Button variant="tertiary" onClick={closeBooking}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }>
      <Column gap="16" paddingTop="8">
        <Select
          id="book-patient"
          label="Patient"
          searchable
          value={patient}
          onValueChange={(v) => setPatient(String(v))}
          error={tried && !patient}
          errorMessage={tried && !patient ? "Pick a patient" : undefined}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.name} · ${p.species}, ${getOwner(p.owner)?.name}`,
          }))}
        />
        {chosen && <AlertBanner name={chosen.name} alerts={chosen.alerts} />}
        <Select
          id="book-vet"
          label="Vet"
          value={vet}
          onValueChange={(v) => setVet(String(v))}
          error={tried && !vet}
          errorMessage={tried && !vet ? "Pick a vet" : undefined}
          options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
        />
        <Row gap="12" s={{ direction: "column" }}>
          <Select
            id="book-length"
            label="Length"
            value={minutes}
            onValueChange={(v) => setMinutes(String(v))}
            options={DURATIONS.map((d) => ({ value: d, label: `${d} minutes` }))}
          />
          <Select
            id="book-time"
            label="Time"
            value={start}
            onValueChange={(v) => setStart(String(v))}
            error={Boolean(startError)}
            errorMessage={startError}
            options={slotOptions}
          />
        </Row>
        <Input
          id="book-reason"
          label="Reason for visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={tried && !reason.trim()}
          errorMessage={tried && !reason.trim() ? "Add a short reason" : undefined}
        />
        <Checkbox
          id="book-urgent"
          label="Urgent visit"
          checked={urgent}
          onCheckedChange={setUrgent}
        />
        {!vet && (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Choose a vet to see which times are free.
          </Text>
        )}
      </Column>
    </Dialog>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import {
  Avatar,
  Breadcrumbs,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SmartLink,
  Tag,
  Text,
} from "@once-ui-system/core";
import { AlertBanner, AlertChips } from "./AlertTags";
import { WeightTrend } from "./WeightTrend";
import { useClinic } from "@/lib/clinic";
import {
  ageText,
  endTime,
  fmtDate,
  getOwner,
  getPatient,
  getVet,
  patients,
  records,
  statusLabel,
  usd,
  vaccineState,
} from "@/lib/data";

function Panel({
  title,
  id,
  aside,
  children,
  wide,
}: {
  title: string;
  id: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Column
      as="section"
      aria-labelledby={id}
      background="surface"
      border
      radius="l"
      padding="24"
      s={{ padding: "16" }}
      gap="16"
      style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Row gap="16" horizontal="between" vertical="start" paddingY="8" borderBottom>
      <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text as="dd" textVariant="body-strong-m" align="right">
        {children}
      </Text>
    </Row>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const { appointments, openBooking } = useClinic();
  const p = getPatient(id);
  if (!p) return null;
  const owner = getOwner(p.owner);
  const record = records[p.id];
  const today = appointments
    .filter((a) => a.patient === p.id)
    .sort((x, y) => x.start.localeCompare(y.start));
  const siblings = patients.filter((o) => o.owner === p.owner && o.id !== p.id);
  const overdue = record ? record.vaccinations.filter((v) => vaccineState(v.due).kind === "overdue") : [];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Today's schedule", href: "/" },
          { label: "Patients" },
          { label: p.name },
        ]}
      />

      <Row gap="16" vertical="center" wrap horizontal="between">
        <Row gap="16" vertical="center">
          <Avatar icon="paw" size="l" />
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              {p.name}
            </Heading>
            <Text onBackground="neutral-weak" textVariant="body-default-m">
              {p.breed} · {p.sex} · {ageText(p.born)}
            </Text>
          </Column>
        </Row>
        <Row gap="8" wrap>
          {owner && (
            <Button variant="secondary" prefixIcon="phone" href={`tel:${owner.phone.replace(/\s/g, "")}`}>
              Call {owner.name.split(" ")[0]}
            </Button>
          )}
          <Button prefixIcon="calendar" onClick={() => openBooking(p.id)}>
            Book follow-up
          </Button>
        </Row>
      </Row>

      <AlertBanner name={p.name} alerts={p.alerts} />
      {overdue.length > 0 && (
        <Row
          background="warning-alpha-weak"
          border="warning-alpha-medium"
          radius="l"
          padding="12"
          paddingX="16"
          gap="12"
          vertical="center">
          <Icon name="warning" onBackground="warning-strong" />
          <Text textVariant="label-strong-m" onBackground="warning-strong">
            {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Row>
      )}

      <Grid columns="2" m={{ columns: "1" }} gap="16">
        <Panel title="Patient and owner" id="details-title">
          <Column as="dl" gap="0" margin="0">
            <Fact label="Species">{p.species}</Fact>
            <Fact label="Breed">{p.breed}</Fact>
            <Fact label="Born">
              {fmtDate(p.born)} ({ageText(p.born)})
            </Fact>
            <Fact label="Sex">{p.sex}</Fact>
            <Fact label="Owner">{owner?.name}</Fact>
            <Fact label="Phone">
              {owner && <SmartLink href={`tel:${owner.phone.replace(/\s/g, "")}`}>{owner.phone}</SmartLink>}
            </Fact>
            <Fact label="Patient ID">{p.id}</Fact>
          </Column>
          {siblings.length > 0 && (
            <Column gap="8">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Other pets of {owner?.name}
              </Text>
              {siblings.map((s) => (
                <Row key={s.id} gap="8" vertical="center" wrap>
                  <SmartLink href={`/patients/${s.id}`}>
                    <Text textVariant="body-strong-m">{s.name}</Text>
                  </SmartLink>
                  <AlertChips alerts={s.alerts} />
                </Row>
              ))}
            </Column>
          )}
        </Panel>

        <Panel title="Today at the clinic" id="today-title">
          {today.length === 0 ? (
            <Text onBackground="neutral-weak">No appointments today.</Text>
          ) : (
            <Column as="ul" gap="8" margin="0" padding="0">
              {today.map((a) => (
                <Row
                  as="li"
                  key={a.id}
                  gap="12"
                  padding="12"
                  radius="m"
                  border
                  vertical="center"
                  wrap
                  style={{ listStyle: "none" }}>
                  <Column width="5rem" gap="0">
                    <Text textVariant="heading-strong-m">{a.start}</Text>
                    <Text textVariant="label-default-xs" onBackground="neutral-weak">
                      to {endTime(a)}
                    </Text>
                  </Column>
                  <Column flex={1} minWidth="10rem" gap="0">
                    <Text textVariant="body-strong-m">{a.reason}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {getVet(a.vet)?.name} · {getVet(a.vet)?.room}
                    </Text>
                  </Column>
                  <Tag
                    tone={a.status === "done" ? "success" : a.status === "checked_in" ? "warning" : a.status === "in_exam" ? "info" : "neutral"}
                    label={statusLabel[a.status]}
                  />
                </Row>
              ))}
            </Column>
          )}
        </Panel>

        {record ? (
          <>
            <Panel title="Weight trend" id="weight-title" wide>
              <WeightTrend points={record.weights_kg} />
            </Panel>

            <Panel
              title="Vaccinations"
              id="vacc-title"
              aside={
                overdue.length > 0 ? (
                  <Tag tone="danger" prefixIcon="warning" label={`${overdue.length} overdue`} />
                ) : (
                  <Tag tone="success" prefixIcon="check" label="All up to date" />
                )
              }>
              <Column as="ul" gap="8" margin="0" padding="0">
                {record.vaccinations.map((v) => {
                  const st = vaccineState(v.due);
                  const bad = st.kind === "overdue";
                  return (
                    <Row
                      as="li"
                      key={v.name}
                      gap="12"
                      padding="12"
                      radius="m"
                      border={bad ? "danger-alpha-strong" : true}
                      background={bad ? "danger-alpha-weak" : "transparent"}
                      vertical="center"
                      horizontal="between"
                      wrap
                      style={{ listStyle: "none" }}>
                      <Column gap="0">
                        <Text textVariant="body-strong-m">{v.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                        </Text>
                      </Column>
                      {bad ? (
                        <Tag tone="danger" prefixIcon="warning" label={`Overdue by ${st.days} days`} />
                      ) : st.kind === "soon" ? (
                        <Tag tone="warning" prefixIcon="time" label={`Due in ${st.days} days`} />
                      ) : (
                        <Tag tone="success" prefixIcon="check" label="Up to date" />
                      )}
                    </Row>
                  );
                })}
              </Column>
            </Panel>

            <Panel title="Current medications" id="meds-title">
              <Column as="ul" gap="8" margin="0" padding="0">
                {record.medications.map((m) => (
                  <Row
                    as="li"
                    key={m.name}
                    gap="12"
                    padding="12"
                    radius="m"
                    border
                    vertical="center"
                    horizontal="between"
                    wrap
                    style={{ listStyle: "none" }}>
                    <Column gap="0">
                      <Text textVariant="body-strong-m">{m.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {m.dose}
                      </Text>
                    </Column>
                    <Text textVariant="label-default-s" onBackground="neutral-weak">
                      Since {fmtDate(m.since)}
                    </Text>
                  </Row>
                ))}
              </Column>
            </Panel>

            <Panel title="Visit history" id="visits-title" wide>
              <Column as="ol" gap="0" margin="0" padding="0">
                {record.visits.map((v, i) => (
                  <Row
                    as="li"
                    key={v.date}
                    gap="24"
                    paddingY="16"
                    borderTop={i > 0}
                    vertical="start"
                    wrap
                    style={{ listStyle: "none" }}>
                    <Column width="9rem" gap="0">
                      <Text textVariant="body-strong-m">{fmtDate(v.date)}</Text>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {getVet(v.vet)?.name}
                      </Text>
                    </Column>
                    <Column flex={1} minWidth="16rem" gap="4">
                      <Text textVariant="heading-strong-m">{v.reason}</Text>
                      <Text textVariant="body-default-m">{v.notes}</Text>
                    </Column>
                    <Text textVariant="label-default-s" onBackground="neutral-weak">
                      Invoice {usd(v.invoice_usd)}
                    </Text>
                  </Row>
                ))}
              </Column>
            </Panel>
          </>
        ) : (
          <Panel title="Clinical record" id="no-record-title" wide>
            <Text onBackground="neutral-weak">
              No weights, vaccinations, medications or visit notes are stored for {p.name} in this demo.
            </Text>
          </Panel>
        )}
      </Grid>
    </>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  type IconName,
  Row,
  SegmentedControl,
  SmartLink,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { AlertChips } from "./AlertTags";
import { useClinic } from "@/lib/clinic";
import {
  type Appointment,
  type Status,
  getOwner,
  getPatient,
  getVet,
  minutesWaiting,
  statusLabel,
  toMin,
  vets,
  waitText,
} from "@/lib/data";

const statusTone: Record<Status, "neutral" | "warning" | "info" | "success" | "danger"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "info",
  done: "success",
  cancelled: "neutral",
};
const statusIcon: Record<Status, IconName> = {
  booked: "calendar",
  checked_in: "time",
  in_exam: "paw",
  done: "check",
  cancelled: "close",
};

function StatusTag({ status }: { status: Status }) {
  return <Tag tone={statusTone[status]} prefixIcon={statusIcon[status]} label={statusLabel[status]} />;
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: "warning-strong" | "info-strong" }) {
  return (
    <Column background="neutral-alpha-weak" radius="l" padding="16" gap="4">
      <Text textVariant="display-strong-xs" onBackground={tone}>
        {value}
      </Text>
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
    </Column>
  );
}

function ApptRow({ a, first, highlight }: { a: Appointment; first: boolean; highlight: boolean }) {
  const { checkIn, setStatus } = useClinic();
  const { addToast } = useToast();
  const p = getPatient(a.patient);
  const owner = p ? getOwner(p.owner) : undefined;
  const vet = getVet(a.vet);
  if (!p) return null;
  const finished = a.status === "done" || a.status === "cancelled";

  return (
    <Row
      as="li"
      gap="16"
      padding="16"
      vertical="center"
      wrap
      borderTop={!first}
      background={a.urgent && !finished ? "danger-alpha-weak" : highlight ? "brand-alpha-weak" : "transparent"}
      style={{ listStyle: "none" }}>
      <Column width="5rem" gap="0">
        <Text textVariant="heading-strong-m" onBackground={finished ? "neutral-weak" : "neutral-strong"}>
          {a.start}
        </Text>
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          {a.minutes} min
        </Text>
      </Column>
      <Column flex={1} minWidth="14rem" gap="4">
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${p.id}`}>
            <Text textVariant="heading-strong-m">{p.name}</Text>
          </SmartLink>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {p.species}, {p.breed}
          </Text>
          {a.urgent && <Tag tone="danger" prefixIcon="bolt" label="Urgent" />}
          {highlight && <Tag tone="brand" label="New" />}
        </Row>
        <Text textVariant="body-default-m">{a.reason}</Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {owner?.name} · {owner?.phone}
        </Text>
        <AlertChips alerts={p.alerts} />
      </Column>
      <Row gap="12" vertical="center" wrap>
        <Column gap="0" width="6.5rem">
          <Text textVariant="label-strong-s">{vet?.name}</Text>
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            {vet?.room}
          </Text>
        </Column>
        <Row width="7.5rem">
          <StatusTag status={a.status} />
        </Row>
        <Row width="7.5rem" horizontal="end">
          {a.status === "booked" && (
            <Button
              prefixIcon="check"
              aria-label={`Check in ${p.name}`}
              onClick={() => {
                checkIn(a.id);
                addToast({ variant: "success", message: `${p.name} is checked in and waiting for ${vet?.name}.` });
              }}>
              Check in
            </Button>
          )}
          {a.status === "checked_in" && (
            <Button
              variant="secondary"
              aria-label={`Start exam for ${p.name}`}
              onClick={() => setStatus(a.id, "in_exam")}>
              Start exam
            </Button>
          )}
          {a.status === "in_exam" && (
            <Button variant="secondary" aria-label={`Finish visit for ${p.name}`} onClick={() => setStatus(a.id, "done")}>
              Finish
            </Button>
          )}
        </Row>
      </Row>
    </Row>
  );
}

function WaitingPanel() {
  const { appointments, now, setStatus } = useClinic();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((x, y) => toMin(x.checkedInAt ?? now) - toMin(y.checkedInAt ?? now));

  return (
    <Column
      width="22rem"
      m={{ width: "100%" }}
      gap="12"
      padding="16"
      radius="l"
      border
      background="neutral-alpha-weak"
      fitHeight
      as="section"
      aria-labelledby="waiting-title">
      <Row horizontal="between" vertical="center">
        <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag tone={waiting.length > 0 ? "warning" : "neutral"} label={`${waiting.length} waiting`} />
      </Row>
      <Column gap="8" as="ol" aria-live="polite">
        {waiting.length === 0 && (
          <Text onBackground="neutral-weak" textVariant="body-default-m">
            Nobody is waiting. Check patients in as they arrive.
          </Text>
        )}
        {waiting.map((a, i) => {
          const p = getPatient(a.patient);
          const vet = getVet(a.vet);
          if (!p) return null;
          const mins = minutesWaiting(a.checkedInAt ?? now, now);
          return (
            <Column
              as="li"
              key={a.id}
              gap="8"
              padding="12"
              radius="m"
              background="surface"
              border
              style={{ listStyle: "none" }}>
              <Row horizontal="between" vertical="center" gap="8">
                <Row gap="8" vertical="center" wrap>
                  <SmartLink href={`/patients/${p.id}`}>
                    <Text textVariant="heading-strong-m">{p.name}</Text>
                  </SmartLink>
                  {i === 0 && <Tag tone="brand" label="Next" />}
                </Row>
                <Tag
                  tone={mins >= 15 ? "danger" : mins >= 8 ? "warning" : "neutral"}
                  prefixIcon="time"
                  label={waitText(mins)}
                />
              </Row>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {a.reason} · for {vet?.name}, {vet?.room} · booked {a.start}
              </Text>
              <AlertChips alerts={p.alerts} />
              <Row>
                <Button
                  size="s"
                  variant="secondary"
                  aria-label={`Start exam for ${p.name}`}
                  onClick={() => setStatus(a.id, "in_exam")}>
                  Start exam
                </Button>
              </Row>
            </Column>
          );
        })}
      </Column>
    </Column>
  );
}

export function Schedule() {
  const { appointments, lastAddedId, openBooking, now } = useClinic();
  const [vetFilter, setVetFilter] = useState("all");
  const [view, setView] = useState("all");

  const rows = useMemo(() => {
    return appointments
      .filter((a) => vetFilter === "all" || a.vet === vetFilter)
      .filter((a) => view === "all" || a.status === "booked" || a.status === "checked_in" || a.status === "in_exam")
      .sort((x, y) => toMin(x.start) - toMin(y.start) || x.vet.localeCompare(y.vet));
  }, [appointments, vetFilter, view]);

  const count = (s: Status) => appointments.filter((a) => a.status === s).length;

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Thursday 12 November 2026 · desk time {now}
          </Text>
          <Heading as="h1" textVariant="display-strong-xs">
            Today&apos;s schedule
          </Heading>
        </Column>
        <Button prefixIcon="plus" onClick={() => openBooking()}>
          Book appointment
        </Button>
      </Row>

      <Grid columns="4" s={{ columns: "2" }} gap="12">
        <Stat value={count("checked_in")} label="Waiting now" tone="warning-strong" />
        <Stat value={count("in_exam")} label="In exam" tone="info-strong" />
        <Stat value={count("booked")} label="Still to arrive" />
        <Stat value={count("done")} label="Done today" />
      </Grid>

      <Row gap="24" direction="row-reverse" m={{ direction: "column" }} vertical="start">
        <WaitingPanel />
        <Column flex={1} gap="12" minWidth="0">
          <Row gap="12" wrap vertical="center">
            <Column flex={1} minWidth="18rem">
              <SegmentedControl
                aria-label="Filter by vet"
                value={vetFilter}
                onValueChange={setVetFilter}
                buttons={[
                  { value: "all", label: "All vets" },
                  ...vets.map((v) => ({ value: v.id, label: v.short })),
                ]}
              />
            </Column>
            <Row maxWidth="14rem" fillWidth s={{ maxWidth: "100%" }}>
              <SegmentedControl
                aria-label="Which appointments to show"
                value={view}
                onValueChange={setView}
                buttons={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                ]}
              />
            </Row>
          </Row>
          <Column as="ul" border radius="l" overflow="hidden" margin="0" padding="0" aria-label="Appointments">
            {rows.length === 0 && (
              <Row padding="24" gap="8" vertical="center">
                <Icon name="calendar" onBackground="neutral-weak" />
                <Text onBackground="neutral-weak">No appointments match this view.</Text>
              </Row>
            )}
            {rows.map((a, i) => (
              <ApptRow key={a.id} a={a} first={i === 0} highlight={a.id === lastAddedId} />
            ))}
          </Column>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {rows.length} of {appointments.length} appointments shown.
          </Text>
        </Column>
      </Row>
    </>
  );
}
```

```tsx components/WeightTrend.tsx
"use client";

import { Column, Row, Tag, Text } from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import { type WeightPoint, fmtDate, fmtMonthYear } from "@/lib/data";

export function WeightTrend({ points }: { points: WeightPoint[] }) {
  const first = points[0];
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;
  const sinceLast = last.kg - prev.kg;
  const data = points.map((p) => ({ date: fmtMonthYear(p.date), kg: p.kg }));
  const summary = `Weight in kilograms at ${points.length} visits: ${points
    .map((p) => `${p.kg} on ${fmtDate(p.date)}`)
    .join(", ")}.`;

  return (
    <Column gap="16" fillWidth>
      <Row gap="16" vertical="center" wrap>
        <Text textVariant="display-strong-xs">{last.kg.toFixed(1)} kg</Text>
        <Column gap="4">
          <Tag
            tone="neutral"
            prefixIcon="trendDown"
            label={`${change.toFixed(1)} kg (${pct.toFixed(1)}%) since ${fmtDate(first.date)}`}
          />
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {sinceLast.toFixed(1)} kg since the visit on {fmtDate(prev.date)}
          </Text>
        </Column>
      </Row>
      <Column fillWidth height={20}>
        <LineChart
          aria-label={`Weight in kilograms over the last ${points.length} visits`}
          summary={summary}
          fillWidth
          height={20}
          curve="monotone"
          series={[{ key: "kg", label: "Weight (kg)" }]}
          data={data}
          legend={{ display: false }}
        />
      </Column>
    </Column>
  );
}
```

```tsx lib/clinic.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type Appointment,
  type Status,
  START_NOW,
  findClash,
  fromMin,
  initialAppointments,
  toMin,
} from "./data";

export type BookingInput = {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
};
export type BookingResult = { ok: true; id: string } | { ok: false; error: string };

type Clinic = {
  appointments: Appointment[];
  now: string;
  lastAddedId: string | null;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookingInput) => BookingResult;
  bookingOpen: boolean;
  bookingPatient: string | null;
  openBooking: (patientId?: string) => void;
  closeBooking: () => void;
};

const ClinicContext = createContext<Clinic | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(START_NOW);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPatient, setBookingPatient] = useState<string | null>(null);

  // The desk clock moves on a minute at a time so waiting times keep counting.
  useEffect(() => {
    const t = setInterval(() => setNow((n) => fromMin(Math.min(toMin(n) + 1, 23 * 60 + 59))), 60000);
    return () => clearInterval(t);
  }, []);

  const setStatus = useCallback(
    (id: string, status: Status) => {
      setAppointments((list) =>
        list.map((a) =>
          a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? now : a.checkedInAt } : a,
        ),
      );
    },
    [now],
  );

  const checkIn = useCallback((id: string) => setStatus(id, "checked_in"), [setStatus]);

  const book = useCallback(
    (input: BookingInput): BookingResult => {
      const clash = findClash(appointments, input.vet, input.start, input.minutes);
      if (clash) return { ok: false, error: "That time overlaps another booking for this vet." };
      const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
      const next: Appointment = {
        id,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
        ...(input.urgent ? { urgent: true } : {}),
      };
      setAppointments((list) => [...list, next]);
      setLastAddedId(id);
      return { ok: true, id };
    },
    [appointments],
  );

  const value = useMemo<Clinic>(
    () => ({
      appointments,
      now,
      lastAddedId,
      checkIn,
      setStatus,
      book,
      bookingOpen,
      bookingPatient,
      openBooking: (patientId?: string) => {
        setBookingPatient(patientId ?? null);
        setBookingOpen(true);
      },
      closeBooking: () => setBookingOpen(false),
    }),
    [appointments, now, lastAddedId, checkIn, setStatus, book, bookingOpen, bookingPatient],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): Clinic {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}
```

```ts lib/data.ts
export const CLINIC = "Hillside Veterinary Clinic";
export const PRODUCT = "Pawpoint";
export const TODAY = "2026-11-12";
/** The simulated clock the desk starts the day at (HH:MM). */
export const START_NOW = "09:50";

export const USER = { name: "Rosa Lindqvist", role: "Receptionist", initials: "RL" };

export type Vet = { id: string; name: string; short: string; room: string };
export type Owner = { id: string; name: string; phone: string };
export type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
};
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** HH:MM the patient was checked in at. */
  checkedInAt?: string;
};

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", short: "Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", short: "Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", short: "Park", room: "Surgery" },
];

export const owners: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const patients: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:08" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export type WeightPoint = { date: string; kg: number };
export type Vaccination = { name: string; given: string; due: string };
export type Medication = { name: string; dose: string; since: string };
export type Visit = { date: string; vet: string; reason: string; notes: string; invoice_usd: number };
export type PatientRecord = {
  weights_kg: WeightPoint[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
};

export const records: Record<string, PatientRecord> = {
  "p-104": {
    weights_kg: [
      { date: "2025-05-14", kg: 31.8 },
      { date: "2025-08-20", kg: 31.1 },
      { date: "2025-11-03", kg: 30.4 },
      { date: "2026-02-11", kg: 29.9 },
      { date: "2026-06-17", kg: 29.2 },
      { date: "2026-11-12", kg: 28.6 },
    ],
    vaccinations: [
      { name: "Rabies", given: "2024-10-02", due: "2027-10-02" },
      { name: "DHPP", given: "2025-10-15", due: "2026-10-15" },
      { name: "Leptospirosis", given: "2025-10-15", due: "2026-10-15" },
      { name: "Bordetella", given: "2026-04-08", due: "2027-04-08" },
    ],
    medications: [
      { name: "Benazepril 5 mg", dose: "1 tablet daily", since: "2025-08-20" },
      { name: "Renal diet (dry)", dose: "2.5 cups daily", since: "2025-08-20" },
    ],
    visits: [
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

// ---------- helpers ----------

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}
export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMin(toMin(a.start) + a.minutes);
}

/** Another live appointment of the same vet that overlaps [start, start+minutes). */
export function findClash(
  list: Appointment[],
  vet: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return list.find((a) => {
    if (a.vet !== vet || a.status === "cancelled") return false;
    const as = toMin(a.start);
    const ae = as + a.minutes;
    return s < ae && as < e;
  });
}

export function minutesWaiting(checkedInAt: string, now: string): number {
  return Math.max(0, toMin(now) - toMin(checkedInAt));
}
export function waitText(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function fmtMonthYear(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
export function daysBetween(fromIso: string, toIso: string): number {
  const utc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(toIso) - utc(fromIso)) / 86400000);
}
export function ageText(born: string, today: string = TODAY): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
}

export type VaccineState = { kind: "overdue" | "soon" | "ok"; days: number };
export function vaccineState(due: string, today: string = TODAY): VaccineState {
  const diff = daysBetween(today, due);
  if (diff < 0) return { kind: "overdue", days: -diff };
  if (diff <= 30) return { kind: "soon", days: diff };
  return { kind: "ok", days: diff };
}

export function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Quarter-hour slots the clinic books into. */
export const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let m = 8 * 60; m <= 16 * 60 + 45; m += 15) out.push(fromMin(m));
  return out;
})();
```


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

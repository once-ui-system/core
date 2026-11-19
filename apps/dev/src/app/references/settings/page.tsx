"use client";

import {
  Avatar,
  Button,
  Column,
  Icon,
  IconButton,
  Input,
  Logo,
  Nav,
  NavItem,
  Row,
  Select,
  Setting,
  StyleScope,
  Switch,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

/**
 * Reference rebuild: a marketplace admin's settings page (label left,
 * control right, quiet group headers, Discard / Apply once something
 * changed). Core components and props only; the look is the StyleScope.
 */

type Values = {
  upload: boolean;
  wizard: boolean;
  commissionType: string;
  commission: number;
  orderStatus: boolean;
  popup: boolean;
  categories: string;
  tags: boolean;
};

const saved: Values = {
  upload: true,
  wizard: true,
  commissionType: "percentage",
  commission: 10,
  orderStatus: false,
  popup: true,
  categories: "one",
  tags: false,
};

const appNav = [
  [
    { icon: "search", label: "Search" },
    { icon: "home", label: "Dashboard" },
    { icon: "edit", label: "Quote requests" },
    { icon: "star", label: "Reviews" },
    { icon: "banknotes", label: "Payouts" },
    { icon: "return", label: "Returns" },
    { icon: "ticket", label: "Coupons" },
    { icon: "megaphone", label: "Announcements" },
  ],
  [
    { icon: "shoppingBag", label: "Products" },
    { icon: "cart", label: "Orders" },
    { icon: "truck", label: "Shipping" },
  ],
  [
    { icon: "report", label: "Reports" },
    { icon: "wrench", label: "Tools" },
    { icon: "settings", label: "Settings", selected: true },
    { icon: "lifebuoy", label: "Support" },
  ],
] as const;

const sections = [
  { icon: "settings", label: "General" },
  { icon: "shoppingBag", label: "Selling options", selected: true },
  { icon: "banknotes", label: "Payout options" },
  { icon: "document", label: "Page settings" },
  { icon: "swatch", label: "Appearance" },
  { icon: "checkBadge", label: "Seller verification" },
  { icon: "phone", label: "Verification SMS" },
  { icon: "mail", label: "Email verification" },
  { icon: "code", label: "Social API" },
  { icon: "person", label: "Vendor contact form" },
] as const;

function GroupLabel({ children }: { children: string }) {
  return (
    <Row paddingX="20" paddingTop="32" paddingBottom="12" borderBottom>
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {children}
      </Text>
    </Row>
  );
}

/** A divided row: Setting without its own box, a hairline under it. */
function Row_({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Setting
      label={<Text textVariant="label-default-m">{label}</Text>}
      controlWidth="10rem"
      border={false}
      radius="none"
      borderBottom
      paddingX="12"
      paddingY="12"
    >
      {children}
    </Setting>
  );
}

export default function SettingsReference() {
  const [values, setValues] = useState<Values>({ ...saved, popup: false });
  const dirty = useMemo(
    () => (Object.keys(saved) as (keyof Values)[]).some((k) => values[k] !== saved[k]),
    [values],
  );
  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <StyleScope
      style={{ width: "100%" }}
      config={{
        theme: "light",
        neutral: "gray",
        brand: "red",
        accent: "red",
        solid: "color",
        border: "conservative",
        pageBackground: "#f7f7f7",
        surfaceBackground: "#ffffff",
      }}
    >
      <Row
        marginX="auto"
        maxWidth="90rem"
        height="56rem"
        background="page"
        border
        radius="xl"
        overflow="hidden"
        shadow="l"
      >
        {/* App sidebar */}
        <Column width="16rem" fillHeight borderRight paddingX="12" paddingY="16" gap="16">
          <Row paddingX="8" paddingY="4" vertical="center" horizontal="between">
            <Logo text="Halden" monogram="H" size="s" />
            <IconButton icon="sidebar" variant="ghost" size="s" tooltip="Collapse" onClick={() => {}} />
          </Row>
          <Nav variant="subtle" density="normal" rail={false} gap="12">
            {appNav.map((group, i) => (
              <Column key={group[0].label} gap="2" borderTop={i > 0} paddingTop={i > 0 ? "12" : "0"}>
                {group.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    selected={"selected" in item && item.selected}
                    href="#"
                  />
                ))}
              </Column>
            ))}
          </Nav>
        </Column>

        <Column fill>
          {/* Top bar */}
          <Row paddingX="24" paddingY="16" vertical="center" horizontal="between" borderBottom>
            <Text textVariant="heading-strong-s">Settings</Text>
            <Row gap="12" vertical="center">
              <IconButton icon="bell" variant="ghost" tooltip="Notifications" onClick={() => {}} />
              <Text textVariant="label-default-s">My shop</Text>
              <Avatar size="s" value="MS" />
            </Row>
          </Row>

          <Row fill padding="16" gap="8" overflow="hidden">
            {/* Section nav */}
            <Column width="18rem" fillHeight background="surface" border radius="l" padding="12" gap="12">
              <Input
                id="settings-search"
                size="xxs"
                label="Search settings"
                placeholder="Search…"
                prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
              />
              <Nav variant="subtle" rail={false} gap="2">
                {sections.map((s) => (
                  <NavItem
                    key={s.label}
                    icon={s.icon}
                    label={s.label}
                    selected={"selected" in s && s.selected}
                    href="#"
                  />
                ))}
              </Nav>
            </Column>

            {/* Panel */}
            <Column fill background="surface" border radius="l" overflow="hidden">
              <Column fill overflowY="auto" paddingX="32" paddingY="24">
                <Column maxWidth="40rem">
                  <Row paddingX="20">
                    <Text as="h1" textVariant="heading-strong-m">
                      Selling options
                    </Text>
                  </Row>
                  <GroupLabel>New vendors</GroupLabel>
                  <Row_ label="Allow new vendors to upload products">
                    <Switch checked={values.upload} onCheckedChange={(c) => set("upload", c)} />
                  </Row_>
                  <Row_ label="Show the setup wizard to new vendors">
                    <Switch checked={values.wizard} onCheckedChange={(c) => set("wizard", c)} />
                  </Row_>

                  <GroupLabel>Commission</GroupLabel>
                  <Row_ label="Commission type">
                    <Select
                      id="commission-type"
                      size="xxs"
                      label="Commission type"
                      value={values.commissionType}
                      onValueChange={(v) => set("commissionType", v as string)}
                      options={[
                        { value: "percentage", label: "Percentage" },
                        { value: "fixed", label: "Fixed" },
                      ]}
                    />
                  </Row_>
                  <Row_ label="Admin commission">
                    <Input
                      id="commission"
                      size="xxs"
                      type="number"
                      label="Admin commission"
                      value={String(values.commission)}
                      onValueChange={(v) => set("commission", Number(v))}
                      suffix={<Text onBackground="neutral-weak">%</Text>}
                    />
                  </Row_>

                  <GroupLabel>Products and orders</GroupLabel>
                  <Row_ label="Allow vendors to update order status">
                    <Switch checked={values.orderStatus} onCheckedChange={(c) => set("orderStatus", c)} />
                  </Row_>
                  <Row_ label="Open product creation in a popup">
                    <Switch checked={values.popup} onCheckedChange={(c) => set("popup", c)} />
                  </Row_>
                  <Row_ label="Categories per product">
                    <Select
                      id="categories"
                      size="xxs"
                      label="Categories per product"
                      value={values.categories}
                      onValueChange={(v) => set("categories", v as string)}
                      options={[
                        { value: "one", label: "One" },
                        { value: "many", label: "Several" },
                      ]}
                    />
                  </Row_>
                  <Row_ label="Allow vendors to create tags">
                    <Switch checked={values.tags} onCheckedChange={(c) => set("tags", c)} />
                  </Row_>
                </Column>
              </Column>
              {dirty && (
                <Row paddingX="24" paddingY="16" gap="8" horizontal="end" vertical="center" borderTop>
                  <Text textVariant="label-default-s" onBackground="neutral-weak" marginRight="auto">
                    Unsaved changes
                  </Text>
                  <Button variant="secondary" size="s" label="Discard" onClick={() => setValues(saved)} />
                  <Button size="s" label="Apply changes" onClick={() => setValues(values)} />
                </Row>
              )}
            </Column>
          </Row>
        </Column>
      </Row>
    </StyleScope>
  );
}

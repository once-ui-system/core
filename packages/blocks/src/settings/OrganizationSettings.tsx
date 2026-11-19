"use client";

import {
  Avatar,
  Button,
  Column,
  Dialog,
  Input,
  Row,
  Setting,
  Skeleton,
  Text,
} from "@once-ui-system/core";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  cropSquare,
  EditableSetting,
  errorMessage,
  ImagePickerButton,
  initials,
  SectionHeader,
  SettingsGroup,
  type SettingsLabelsInput,
  useAction,
  useSettingsLabels,
} from "./shared.js";
import type { Organization, OrganizationAdapter } from "./types.js";
import { useOrganization } from "./useAccount.js";

export interface OrganizationSettingsProps {
  adapter: OrganizationAdapter;
  /** Rows only this app has, such as business details, after the name and address. */
  extraRows?: ReactNode;
  /** Where people go after leaving or deleting. Called once the adapter resolves. */
  onGone?: () => void;
  hideHeader?: boolean;
  labels?: SettingsLabelsInput;
}

const canEdit = (organization: Organization) =>
  organization.role === "owner" || organization.role === "admin";

/**
 * The organization's logo, name and address, and leaving or deleting it.
 * Owners and admins edit; members see the same rows read only. Deleting asks
 * for the address to be typed, so it never happens by a slip.
 */
export function OrganizationSettings({
  adapter,
  extraRows,
  onGone,
  hideHeader,
  labels: labelsProp,
}: OrganizationSettingsProps) {
  const labels = useSettingsLabels(labelsProp);
  const { organization, error, update, setData } = useOrganization(adapter);

  if (error) {
    return (
      <Text textVariant="body-default-s" onBackground="danger-weak" role="alert">
        {errorMessage(error, labels.common.failed)}
      </Text>
    );
  }

  const editable = organization ? canEdit(organization) : false;

  return (
    <Column fillWidth gap="32">
      {!hideHeader && (
        <SectionHeader
          title={labels.organization.title}
          description={
            organization && !editable
              ? labels.organization.readOnly
              : labels.organization.description
          }
        />
      )}
      {!organization ? (
        <Column gap="8" aria-busy="true">
          <Skeleton shape="block" height={56} />
          <Skeleton shape="block" height={56} />
        </Column>
      ) : (
        <>
          <Column fillWidth gap="8">
            {adapter.logo && (
              <LogoSetting
                organization={organization}
                adapter={adapter}
                editable={editable}
                onChange={(next) => setData(next)}
              />
            )}
            <EditableSetting
              id="settings-org-name"
              label={labels.organization.name}
              description={labels.organization.nameDescription}
              value={organization.name}
              inputProps={{ maxLength: 80, autoComplete: "organization" }}
              onSave={
                editable && adapter.rename
                  ? async (name) => {
                      if (!name) throw new Error(labels.common.failed);
                      await update((await adapter.rename?.(name)) ?? { ...organization, name });
                    }
                  : undefined
              }
            />
            <Setting
              label={labels.organization.address}
              description={labels.organization.addressDescription}
            >
              <Text textVariant="code-default-s" onBackground="neutral-weak" truncate>
                {organization.slug}
              </Text>
            </Setting>
            {extraRows}
          </Column>
          {(adapter.leave || (adapter.delete && organization.role === "owner")) && (
            <OrganizationDanger organization={organization} adapter={adapter} onGone={onGone} />
          )}
        </>
      )}
    </Column>
  );
}

function LogoSetting({
  organization,
  adapter,
  editable,
  onChange,
}: {
  organization: Organization;
  adapter: OrganizationAdapter;
  editable: boolean;
  onChange: (organization: Organization) => void;
}) {
  const labels = useSettingsLabels();
  const { busy, run } = useAction();
  const logo = adapter.logo;
  if (!logo) return null;

  return (
    <Setting
      label={
        <Row gap="16" vertical="center">
          <Avatar
            size="l"
            src={organization.logoUrl ?? undefined}
            value={organization.logoUrl ? undefined : initials(organization.name)}
            loading={busy}
          />
          <Column gap="4">
            <Text textVariant="label-default-s">{labels.organization.logo}</Text>
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              {labels.organization.logoDescription}
            </Text>
          </Column>
        </Row>
      }
    >
      {editable && organization.logoUrl && logo.remove && (
        <Button
          size="s"
          variant="tertiary"
          weight="default"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await logo.remove?.();
              onChange({ ...organization, logoUrl: null });
            }, labels.common.saved)
          }
        >
          {labels.profile.remove}
        </Button>
      )}
      {editable && (
        <ImagePickerButton
          label={labels.profile.upload}
          loading={busy}
          onPick={(file) =>
            void run(async () => {
              const url = await logo.upload(await cropSquare(file));
              onChange({ ...organization, logoUrl: url });
            }, labels.common.saved)
          }
        />
      )}
    </Setting>
  );
}

function OrganizationDanger({
  organization,
  adapter,
  onGone,
}: {
  organization: Organization;
  adapter: OrganizationAdapter;
  onGone?: () => void;
}) {
  const labels = useSettingsLabels();
  const [confirm, setConfirm] = useState<"leave" | "delete" | null>(null);
  const [typed, setTyped] = useState("");
  const { busy, run } = useAction();
  const owner = organization.role === "owner";
  const close = () => {
    setConfirm(null);
    setTyped("");
  };
  const act = async () => {
    const fn = confirm === "delete" ? adapter.delete : adapter.leave;
    if (!fn) return;
    const ok = await run(() => fn());
    if (ok) {
      close();
      onGone?.();
    }
  };

  return (
    <SettingsGroup title={labels.danger.title} tone="danger">
      {/* An owner cannot leave without handing over first; they delete instead. */}
      {adapter.leave && !owner && (
        <Setting
          label={labels.organization.leave}
          description={labels.organization.leaveDescription}
          border="danger-alpha-medium"
          background="danger-alpha-weak"
        >
          <Button size="s" variant="secondary" tone="danger" onClick={() => setConfirm("leave")}>
            {labels.organization.leave}
          </Button>
        </Setting>
      )}
      {adapter.delete && owner && (
        <Setting
          label={labels.organization.delete}
          description={labels.organization.deleteDescription}
          border="danger-alpha-medium"
          background="danger-alpha-weak"
        >
          <Button size="s" variant="secondary" tone="danger" onClick={() => setConfirm("delete")}>
            {labels.organization.delete}
          </Button>
        </Setting>
      )}
      <Dialog
        open={confirm !== null}
        onClose={close}
        title={
          confirm === "delete" ? labels.organization.deleteTitle : labels.organization.leaveTitle
        }
        description={
          confirm === "delete" ? labels.organization.deleteBody : labels.organization.leaveBody
        }
        footer={
          <Row fillWidth horizontal="end" gap="8">
            <Button size="s" variant="tertiary" weight="default" onClick={close} disabled={busy}>
              {labels.common.cancel}
            </Button>
            <Button
              size="s"
              tone="danger"
              loading={busy}
              disabled={confirm === "delete" && typed !== organization.slug}
              onClick={() => void act()}
            >
              {confirm === "delete" ? labels.organization.delete : labels.organization.leave}
            </Button>
          </Row>
        }
      >
        {confirm === "delete" && (
          <Input
            id="settings-org-confirm"
            label={labels.organization.typeToConfirm(organization.slug)}
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        )}
      </Dialog>
    </SettingsGroup>
  );
}

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
  Tag,
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
  type SettingsLabelsInput,
  useAction,
  useReauth,
  useSettingsLabels,
} from "./shared.js";
import type { Account, AccountAdapter } from "./types.js";
import { useAccount } from "./useAccount.js";

export interface AccountSettingsProps {
  adapter: AccountAdapter;
  /** Optional fields. Name, photo and email are always shown when the adapter supports them. */
  fields?: { username?: boolean };
  /** Rows only this app has, after the built-in ones. */
  extraRows?: ReactNode;
  /** Hides the section heading, for a page that has its own. */
  hideHeader?: boolean;
  labels?: SettingsLabelsInput;
}

/**
 * The person's profile: photo, name, an optional username, and email. Each
 * row saves on its own; the email change opens a dialog that asks for the
 * current password and waits for the link in the new inbox.
 */
export function AccountSettings({
  adapter,
  fields,
  extraRows,
  hideHeader,
  labels: labelsProp,
}: AccountSettingsProps) {
  const labels = useSettingsLabels(labelsProp);
  const { account, error, update } = useAccount(adapter);

  return (
    <Column fillWidth gap="24">
      {!hideHeader && (
        <SectionHeader title={labels.profile.title} description={labels.profile.description} />
      )}
      {error ? (
        <Text textVariant="body-default-s" onBackground="danger-weak" role="alert">
          {errorMessage(error, labels.common.failed)}
        </Text>
      ) : !account ? (
        <Column gap="8" aria-busy="true">
          <Skeleton shape="block" height={56} />
          <Skeleton shape="block" height={56} />
          <Skeleton shape="block" height={56} />
        </Column>
      ) : (
        <Column fillWidth gap="8">
          {adapter.avatar && <PhotoSetting account={account} adapter={adapter} onChange={update} />}
          <EditableSetting
            id="settings-name"
            label={labels.profile.name}
            description={labels.profile.nameDescription}
            value={account.name}
            inputProps={{ autoComplete: "name", maxLength: 80 }}
            onSave={
              adapter.updateProfile
                ? async (name) => update(await adapter.updateProfile?.({ name }))
                : undefined
            }
          />
          {fields?.username && (
            <EditableSetting
              id="settings-username"
              label={labels.profile.username}
              description={labels.profile.usernameDescription}
              value={account.username}
              inputProps={{ autoComplete: "username", maxLength: 40 }}
              onSave={
                adapter.updateProfile
                  ? async (username) => update(await adapter.updateProfile?.({ username }))
                  : undefined
              }
            />
          )}
          <EmailSetting account={account} adapter={adapter} onChange={update} />
          {extraRows}
        </Column>
      )}
    </Column>
  );
}

function PhotoSetting({
  account,
  adapter,
  onChange,
}: {
  account: Account;
  adapter: AccountAdapter;
  onChange: (account: Account) => void;
}) {
  const labels = useSettingsLabels();
  const { busy, run } = useAction();
  const avatar = adapter.avatar;
  if (!avatar) return null;

  const upload = (file: File) =>
    run(async () => {
      const url = await avatar.upload(await cropSquare(file));
      onChange({ ...account, avatarUrl: url });
    }, labels.profile.photoSaved);
  const remove = avatar.remove
    ? () =>
        run(async () => {
          await avatar.remove?.();
          onChange({ ...account, avatarUrl: null });
        }, labels.profile.photoRemoved)
    : undefined;

  return (
    <Setting
      label={
        <Row gap="16" vertical="center">
          <Avatar
            size="l"
            src={account.avatarUrl ?? undefined}
            value={account.avatarUrl ? undefined : initials(account.name, account.email)}
            loading={busy}
          />
          <Column gap="4">
            <Text textVariant="label-default-s">{labels.profile.photo}</Text>
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              {labels.profile.photoDescription}
            </Text>
          </Column>
        </Row>
      }
    >
      {account.avatarUrl && remove && (
        <Button
          size="s"
          variant="tertiary"
          weight="default"
          onClick={() => void remove()}
          disabled={busy}
        >
          {labels.profile.remove}
        </Button>
      )}
      <ImagePickerButton
        label={labels.profile.upload}
        onPick={(file) => void upload(file)}
        loading={busy}
      />
    </Setting>
  );
}

function EmailSetting({
  account,
  adapter,
  onChange,
}: {
  account: Account;
  adapter: AccountAdapter;
  onChange: (account: Account) => void;
}) {
  const labels = useSettingsLabels();
  const [open, setOpen] = useState(false);
  const { busy, run } = useAction();

  const status =
    account.emailVerified === undefined ? null : account.emailVerified ? (
      <Tag tone="success" size="s">
        {labels.profile.verified}
      </Tag>
    ) : (
      <Tag tone="warning" size="s">
        {labels.profile.unverified}
      </Tag>
    );

  return (
    <>
      <Setting
        label={labels.profile.email}
        description={
          account.pendingEmail
            ? labels.profile.pending(account.pendingEmail)
            : labels.profile.emailDescription
        }
        controlWidth="24rem"
      >
        <Text textVariant="label-default-s" onBackground="neutral-medium" truncate>
          {account.email}
        </Text>
        {status}
        {account.pendingEmail && adapter.cancelEmailChange ? (
          <Button
            size="s"
            variant="tertiary"
            weight="default"
            loading={busy}
            onClick={() =>
              void run(async () => {
                await adapter.cancelEmailChange?.();
                onChange({ ...account, pendingEmail: null });
              }, labels.email.changeCancelled)
            }
          >
            {labels.email.cancelChange}
          </Button>
        ) : null}
        {adapter.changeEmail && (
          <Button size="s" variant="secondary" onClick={() => setOpen(true)}>
            {labels.profile.change}
          </Button>
        )}
      </Setting>
      {adapter.changeEmail && (
        <ChangeEmailDialog
          open={open}
          onClose={() => setOpen(false)}
          account={account}
          adapter={adapter}
          onChange={onChange}
        />
      )}
    </>
  );
}

function ChangeEmailDialog({
  open,
  onClose,
  account,
  adapter,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  account: Account;
  adapter: AccountAdapter;
  onChange: (account: Account) => void;
}) {
  const labels = useSettingsLabels();
  const [email, setEmail] = useState("");
  const reauth = useReauth(account.hasPassword, "settings-email-password");
  const { busy, run } = useAction();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim() !== account.email;

  const close = () => {
    setEmail("");
    reauth.reset();
    onClose();
  };
  const submit = async () => {
    const next = email.trim();
    const ok = await run(async () => {
      const result = await adapter.changeEmail?.(next, reauth.proof);
      onChange({ ...account, pendingEmail: result?.pending ?? next });
    }, labels.email.sent(next));
    if (ok) close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={labels.email.title}
      description={labels.email.description}
      footer={
        <Row fillWidth horizontal="end" gap="8">
          <Button size="s" variant="tertiary" weight="default" onClick={close} disabled={busy}>
            {labels.common.cancel}
          </Button>
          <Button
            size="s"
            loading={busy}
            disabled={!valid || !reauth.ready}
            onClick={() => void submit()}
          >
            {labels.email.send}
          </Button>
        </Row>
      }
    >
      <Column
        as="form"
        gap="16"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          if (valid && reauth.ready) void submit();
        }}
      >
        <Input
          id="settings-new-email"
          type="email"
          label={labels.email.newEmail}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {reauth.field}
      </Column>
    </Dialog>
  );
}

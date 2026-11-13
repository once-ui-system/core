"use client";

import {
  Button,
  Checkbox,
  Column,
  Dialog,
  Icon,
  Input,
  Media,
  OTPInput,
  Row,
  Setting,
  Skeleton,
  Tag,
  Text,
} from "@once-ui-system/core";
import type React from "react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  errorMessage,
  SectionHeader,
  SettingsGroup,
  type SettingsLabelsInput,
  useAction,
  useReauth,
  useSettingsLabels,
} from "./shared.js";
import type { Account, AccountAdapter, Identity, Session, TwoFactorEnrollment } from "./types.js";
import { useAccount } from "./useAccount.js";

export interface SecuritySettingsProps {
  adapter: AccountAdapter;
  /** Rows only this app has (API keys, say), after sign-in and before the danger zone. */
  extraRows?: ReactNode;
  hideHeader?: boolean;
  labels?: SettingsLabelsInput;
}

/**
 * How the person signs in, and what keeps it safe: password, two-step
 * verification, connected accounts, signed-in devices and deleting the
 * account. A row shows only when the adapter implements it.
 */
export function SecuritySettings({
  adapter,
  extraRows,
  hideHeader,
  labels: labelsProp,
}: SecuritySettingsProps) {
  const labels = useSettingsLabels(labelsProp);
  const { account, error, update } = useAccount(adapter);

  if (error) {
    return (
      <Text textVariant="body-default-s" onBackground="danger-weak" role="alert">
        {errorMessage(error, labels.common.failed)}
      </Text>
    );
  }

  return (
    <Column fillWidth gap="32">
      {!hideHeader && <SectionHeader title={labels.sections.security} />}
      {!account ? (
        <Column gap="8" aria-busy="true">
          <Skeleton shape="block" height={56} />
          <Skeleton shape="block" height={56} />
        </Column>
      ) : (
        <>
          {(adapter.changePassword || adapter.twoFactor) && (
            <SettingsGroup>
              {adapter.changePassword && (
                <PasswordSetting account={account} adapter={adapter} onChange={update} />
              )}
              {adapter.twoFactor && <TwoFactorSetting account={account} adapter={adapter} />}
            </SettingsGroup>
          )}
          {adapter.identities && <IdentitiesGroup account={account} adapter={adapter} />}
          {adapter.sessions && <SessionsGroup adapter={adapter} />}
          {extraRows}
          {adapter.deleteAccount && <DeleteAccountGroup account={account} adapter={adapter} />}
        </>
      )}
    </Column>
  );
}

function DialogFooter({
  onCancel,
  busy,
  children,
  start,
}: {
  onCancel: () => void;
  busy?: boolean;
  children: ReactNode;
  start?: ReactNode;
}) {
  const labels = useSettingsLabels();
  return (
    <Row fillWidth horizontal="between" vertical="center" gap="8">
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {start}
      </Text>
      <Row gap="8">
        <Button size="s" variant="tertiary" weight="default" onClick={onCancel} disabled={busy}>
          {labels.common.cancel}
        </Button>
        {children}
      </Row>
    </Row>
  );
}

function PasswordSetting({
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
  const [next, setNext] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const reauth = useReauth(account.hasPassword, "settings-password-current");
  const { busy, run } = useAction();
  const tooShort = next.length > 0 && next.length < 8;

  const close = () => {
    setOpen(false);
    setNext("");
    reauth.reset();
  };
  const submit = async () => {
    const ok = await run(async () => {
      await adapter.changePassword?.(next, reauth.proof, { signOutOthers });
      onChange({ ...account, hasPassword: true, passwordChangedAt: new Date().toISOString() });
    }, labels.password.changed);
    if (ok) close();
  };

  const changedAt = account.passwordChangedAt
    ? labels.formatDate(account.passwordChangedAt)
    : undefined;

  return (
    <>
      <Setting label={labels.password.row} description={labels.password.rowDescription(changedAt)}>
        <Button size="s" variant="secondary" onClick={() => setOpen(true)}>
          {account.hasPassword === false ? labels.password.set : labels.password.change}
        </Button>
      </Setting>
      <Dialog
        open={open}
        onClose={close}
        title={account.hasPassword === false ? labels.password.set : labels.password.title}
        description={labels.password.description}
        footer={
          <DialogFooter onCancel={close} busy={busy}>
            <Button
              size="s"
              loading={busy}
              disabled={next.length < 8 || !reauth.ready}
              onClick={() => void submit()}
            >
              {account.hasPassword === false ? labels.password.set : labels.password.title}
            </Button>
          </DialogFooter>
        }
      >
        <Column
          as="form"
          gap="16"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            if (next.length >= 8 && reauth.ready) void submit();
          }}
        >
          {account.hasPassword !== false && reauth.field}
          <Input
            id="settings-password-new"
            type="password"
            label={labels.password.newPassword}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={tooShort}
            errorMessage={tooShort ? labels.password.tooShort : undefined}
          />
          {adapter.sessions && (
            <Checkbox
              id="settings-password-signout"
              label={labels.password.signOutOthers}
              checked={signOutOthers}
              onCheckedChange={setSignOutOthers}
            />
          )}
        </Column>
      </Dialog>
    </>
  );
}

type TwoFactorStep = "closed" | "scan" | "code" | "backup" | "disable";

function TwoFactorSetting({ account, adapter }: { account: Account; adapter: AccountAdapter }) {
  const labels = useSettingsLabels();
  const twoFactor = adapter.twoFactor;
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<TwoFactorStep>("closed");
  const [enrollment, setEnrollment] = useState<TwoFactorEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const reauth = useReauth(account.hasPassword, "settings-2fa-password");
  const { busy, run } = useAction();

  useEffect(() => {
    let live = true;
    twoFactor
      ?.enabled()
      .then((value) => live && setEnabled(value))
      .catch(() => live && setEnabled(false));
    return () => {
      live = false;
    };
  }, [twoFactor]);

  const close = useCallback(() => {
    setStep("closed");
    setEnrollment(null);
    setCode("");
    setCodeError(null);
    setBackupCodes([]);
    reauth.reset();
  }, [reauth.reset]);

  if (!twoFactor) return null;

  // Step 1 asks for the password first when there is one: the secret is
  // only fetched once the person has proved who they are.
  const start = () =>
    run(async () => {
      setEnrollment(await twoFactor.enroll(reauth.proof));
    });

  const verify = async (value = code) => {
    if (value.length < 6) return;
    setCodeError(null);
    try {
      const result = await twoFactor.verify(value);
      setEnabled(true);
      if (result?.backupCodes?.length) {
        setBackupCodes(result.backupCodes);
        setStep("backup");
      } else {
        close();
      }
    } catch (e) {
      setCodeError(errorMessage(e, labels.twoFactor.wrongCode));
      setCode("");
    }
  };

  const disable = async () => {
    const ok = await run(async () => {
      await twoFactor.disable(code);
      setEnabled(false);
    }, labels.twoFactor.disabled);
    if (ok) close();
    else setCode("");
  };

  const total = 3;
  const footerStep = (n: number) => labels.twoFactor.step(n, total);

  let dialog: ReactNode = null;
  if (step === "scan") {
    dialog = (
      <Dialog
        open
        onClose={close}
        title={labels.twoFactor.scanTitle}
        description={labels.twoFactor.scanDescription}
        footer={
          <DialogFooter onCancel={close} busy={busy} start={footerStep(1)}>
            {enrollment ? (
              <Button size="s" onClick={() => setStep("code")}>
                {labels.common.next}
              </Button>
            ) : (
              <Button size="s" loading={busy} disabled={!reauth.ready} onClick={() => void start()}>
                {labels.common.next}
              </Button>
            )}
          </DialogFooter>
        }
      >
        {enrollment ? (
          <Row gap="20" vertical="center" s={{ direction: "column", horizontal: "start" }}>
            {enrollment.qrCode && (
              <Column
                width={160}
                height={160}
                padding="8"
                radius="m"
                border
                flex={0}
                // A QR code scans only dark on light, whatever the theme.
                style={{ background: "white" }}
              >
                <Media
                  src={enrollment.qrCode}
                  alt={labels.twoFactor.qrAlt}
                  aspectRatio="1"
                  unoptimized
                />
              </Column>
            )}
            <Column gap="8" minWidth={0}>
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {labels.twoFactor.orEnterKey}
              </Text>
              <Text textVariant="code-default-s" style={{ wordBreak: "break-all" }}>
                {enrollment.secret.replace(/(.{4})/g, "$1 ").trim()}
              </Text>
              <CopyButton text={enrollment.secret} />
            </Column>
          </Row>
        ) : (
          reauth.field
        )}
      </Dialog>
    );
  } else if (step === "code" || step === "disable") {
    const disabling = step === "disable";
    dialog = (
      <Dialog
        open
        onClose={close}
        title={disabling ? labels.twoFactor.disableTitle : labels.twoFactor.codeTitle}
        description={
          disabling ? labels.twoFactor.disableDescription : labels.twoFactor.codeDescription
        }
        footer={
          <DialogFooter onCancel={close} busy={busy} start={disabling ? undefined : footerStep(2)}>
            <Button
              size="s"
              tone={disabling ? "danger" : undefined}
              loading={busy}
              disabled={code.length < 6}
              onClick={() => void (disabling ? disable() : verify())}
            >
              {disabling ? labels.twoFactor.turnOff : labels.twoFactor.verify}
            </Button>
          </DialogFooter>
        }
      >
        <OTPInput
          length={6}
          autoFocus
          value={code}
          onValueChange={(value) => {
            setCode(value);
            setCodeError(null);
          }}
          onComplete={(value) => {
            if (!disabling) void verify(value);
          }}
          error={Boolean(codeError)}
          errorMessage={codeError ?? undefined}
        />
      </Dialog>
    );
  } else if (step === "backup") {
    dialog = (
      <Dialog
        open
        onClose={close}
        title={labels.twoFactor.backupTitle}
        description={labels.twoFactor.backupDescription}
        footer={
          <Row fillWidth horizontal="between" vertical="center">
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              {footerStep(3)}
            </Text>
            <Button size="s" onClick={close}>
              {labels.twoFactor.done}
            </Button>
          </Row>
        }
      >
        <Column gap="12">
          <Column
            as="ul"
            padding="16"
            radius="l"
            border
            background="page"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.5rem 1.5rem",
            }}
          >
            {backupCodes.map((backup) => (
              <Text as="li" key={backup} textVariant="code-default-s">
                {backup}
              </Text>
            ))}
          </Column>
          <Row>
            <CopyButton text={backupCodes.join("\n")} />
          </Row>
        </Column>
      </Dialog>
    );
  }

  return (
    <>
      <Setting label={labels.twoFactor.row} description={labels.twoFactor.rowDescription}>
        {enabled === null ? (
          <Skeleton shape="line" width={64} />
        ) : (
          <>
            <Tag tone={enabled ? "success" : "neutral"} size="s">
              {enabled ? labels.twoFactor.on : labels.twoFactor.off}
            </Tag>
            {enabled ? (
              <Button size="s" variant="secondary" onClick={() => setStep("disable")}>
                {labels.twoFactor.turnOff}
              </Button>
            ) : (
              <Button size="s" variant="secondary" onClick={() => setStep("scan")}>
                {labels.twoFactor.setUp}
              </Button>
            )}
          </>
        )}
      </Setting>
      {dialog}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const labels = useSettingsLabels();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="s"
      variant="secondary"
      prefixIcon={copied ? "check" : "copy"}
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => setCopied(false));
      }}
    >
      {copied ? labels.common.copied : labels.common.copy}
    </Button>
  );
}

function IdentitiesGroup({ account, adapter }: { account: Account; adapter: AccountAdapter }) {
  const labels = useSettingsLabels();
  const identities = adapter.identities;
  const [linked, setLinked] = useState<Identity[] | null>(null);
  const { busy, run } = useAction();

  useEffect(() => {
    let live = true;
    identities
      ?.list()
      .then((list) => live && setLinked(list))
      .catch(() => live && setLinked([]));
    return () => {
      live = false;
    };
  }, [identities]);

  if (!identities) return null;
  // Disconnecting the last way in would lock the person out.
  const onlyWayIn = (linked?.length ?? 0) <= 1 && account.hasPassword === false;

  return (
    <SettingsGroup title={labels.identities.title}>
      {identities.providers.map((provider) => {
        const identity = linked?.find((item) => item.provider === provider.id);
        const description = identity
          ? [
              identity.detail,
              identity.connectedAt &&
                labels.identities.connectedSince(labels.formatDate(identity.connectedAt)),
            ]
              .filter(Boolean)
              .join(" · ")
          : labels.identities.notConnected;
        return (
          <Setting
            key={provider.id}
            label={
              <Row gap="12" vertical="center">
                <Row
                  width={32}
                  height={32}
                  center
                  radius="m"
                  border
                  background="surface"
                  flex={0}
                  aria-hidden="true"
                >
                  {provider.icon ? (
                    <Icon name={provider.icon} size="s" />
                  ) : (
                    <Text textVariant="label-strong-s">{provider.label.slice(0, 1)}</Text>
                  )}
                </Row>
                <Column gap="2">
                  <Text textVariant="label-default-s">{provider.label}</Text>
                  <Text textVariant="label-default-xs" onBackground="neutral-weak">
                    {linked === null ? "…" : description}
                  </Text>
                </Column>
              </Row>
            }
          >
            {linked !== null &&
              (identity ? (
                <Button
                  size="s"
                  variant="secondary"
                  disabled={busy || onlyWayIn}
                  title={onlyWayIn ? labels.identities.lastMethod : undefined}
                  onClick={() =>
                    void run(async () => {
                      await identities.unlink(identity.id);
                      setLinked((list) => list?.filter((item) => item.id !== identity.id) ?? null);
                    }, labels.identities.disconnected)
                  }
                >
                  {labels.identities.disconnect}
                </Button>
              ) : (
                <Button
                  size="s"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void run(() => identities.link(provider.id))}
                >
                  {labels.identities.connect}
                </Button>
              ))}
          </Setting>
        );
      })}
    </SettingsGroup>
  );
}

function SessionsGroup({ adapter }: { adapter: AccountAdapter }) {
  const labels = useSettingsLabels();
  const sessions = adapter.sessions;
  const [list, setList] = useState<Session[] | null>(null);
  const { busy, run } = useAction();

  useEffect(() => {
    let live = true;
    sessions
      ?.list?.()
      .then((items) => live && setList(items))
      .catch(() => live && setList([]));
    return () => {
      live = false;
    };
  }, [sessions]);

  if (!sessions) return null;
  const others = list?.filter((session) => !session.current) ?? [];

  return (
    <SettingsGroup title={labels.sessions.title}>
      {list?.map((session) => (
        <Setting
          key={session.id}
          label={session.device}
          description={[
            session.location,
            session.lastActiveAt && labels.formatDate(session.lastActiveAt),
          ]
            .filter(Boolean)
            .join(" · ")}
        >
          {session.current ? (
            <Tag size="s">{labels.sessions.thisDevice}</Tag>
          ) : sessions.revoke ? (
            <Button
              size="s"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await sessions.revoke?.(session.id);
                  setList((items) => items?.filter((item) => item.id !== session.id) ?? null);
                }, labels.sessions.signedOut)
              }
            >
              {labels.sessions.signOut}
            </Button>
          ) : null}
        </Setting>
      ))}
      {(!sessions.list || others.length > 0) && (
        <Setting
          label={labels.sessions.signOutOthers}
          description={labels.sessions.signOutOthersDescription}
        >
          <Button
            size="s"
            variant="secondary"
            loading={busy}
            onClick={() =>
              void run(async () => {
                await sessions.revokeOthers();
                setList((items) => items?.filter((item) => item.current) ?? null);
              }, labels.sessions.othersSignedOut)
            }
          >
            {labels.sessions.signOut}
          </Button>
        </Setting>
      )}
    </SettingsGroup>
  );
}

function DeleteAccountGroup({ account, adapter }: { account: Account; adapter: AccountAdapter }) {
  const labels = useSettingsLabels();
  const [open, setOpen] = useState(false);
  const reauth = useReauth(account.hasPassword, "settings-delete-password");
  const { busy, run } = useAction();
  const close = () => {
    setOpen(false);
    reauth.reset();
  };

  return (
    <SettingsGroup title={labels.danger.title} tone="danger">
      <Setting
        label={labels.danger.deleteAccount}
        description={labels.danger.deleteAccountDescription}
        border="danger-alpha-medium"
        background="danger-alpha-weak"
      >
        <Button size="s" variant="secondary" tone="danger" onClick={() => setOpen(true)}>
          {labels.danger.deleteAccount}
        </Button>
      </Setting>
      <Dialog
        open={open}
        onClose={close}
        title={labels.danger.deleteAccountTitle}
        description={labels.danger.deleteAccountBody}
        footer={
          <DialogFooter onCancel={close} busy={busy}>
            <Button
              size="s"
              tone="danger"
              loading={busy}
              disabled={!reauth.ready}
              onClick={() =>
                void run(() => adapter.deleteAccount?.(reauth.proof) ?? Promise.resolve())
              }
            >
              {labels.danger.deleteAccountConfirm}
            </Button>
          </DialogFooter>
        }
      >
        {reauth.field}
      </Dialog>
    </SettingsGroup>
  );
}

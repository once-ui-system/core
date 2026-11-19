import type { IconName } from "@once-ui-system/core";
import type { ReactNode } from "react";

/**
 * The settings blocks know nothing about auth. They read and write through
 * an adapter, and an app supplies one for its provider: Supabase, Better
 * Auth, or anything else. Every method past `getAccount` is optional: leave
 * one out and the row that needs it is not rendered, so an app never shows a
 * control that cannot work.
 */

/** Proof that the person at the keyboard is the account's owner, asked for
 *  before a sensitive change. An account without a password (magic link,
 *  social sign-in) passes `recentSignIn` and the adapter checks the session's
 *  age. */
export type Reauth = { password: string } | { recentSignIn: true };

export interface Account {
  id: string;
  email: string;
  emailVerified?: boolean;
  /** A change waiting for the link in the new inbox. */
  pendingEmail?: string | null;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  /** False for accounts that only sign in with a link or a provider. */
  hasPassword?: boolean;
  passwordChangedAt?: string | null;
  createdAt?: string | null;
}

/** The fields an app lets people edit on their profile. */
export interface ProfilePatch {
  name?: string;
  username?: string;
}

export interface Identity {
  /** The id `unlink` takes. */
  id: string;
  /** `google`, `github`, … */
  provider: string;
  /** The address or handle on the provider's side. */
  detail?: string | null;
  connectedAt?: string | null;
}

export interface Provider {
  id: string;
  label: string;
  icon?: IconName;
}

export interface Session {
  id: string;
  /** "Chrome on Windows". */
  device: string;
  /** "Budapest", or an IP when no place is known. */
  location?: string | null;
  lastActiveAt?: string | null;
  current?: boolean;
}

export interface TwoFactorEnrollment {
  /** The key people type in when they cannot scan. */
  secret: string;
  /** The `otpauth://` URI the QR code encodes. */
  uri: string;
  /** A ready image of the QR code (a data URL or an image URL). Supabase
   *  returns one; for Better Auth the app renders the URI to an image. */
  qrCode?: string;
}

export interface AccountAdapter {
  getAccount(): Promise<Account>;
  updateProfile?(patch: ProfilePatch): Promise<Account | void>;
  avatar?: {
    /** Receives the image already cropped square and resized. Returns its URL. */
    upload(file: Blob): Promise<string>;
    remove?(): Promise<void>;
  };
  /** Starts the change. Resolves with the address waiting for confirmation. */
  changeEmail?(next: string, proof: Reauth): Promise<{ pending: string } | void>;
  cancelEmailChange?(): Promise<void>;
  changePassword?(next: string, proof: Reauth, options: { signOutOthers: boolean }): Promise<void>;
  twoFactor?: {
    enabled(): Promise<boolean>;
    enroll(proof: Reauth): Promise<TwoFactorEnrollment>;
    /** Confirms the first code. Returns backup codes when the provider has them. */
    verify(code: string): Promise<{ backupCodes?: string[] } | void>;
    disable(code: string): Promise<void>;
  };
  identities?: {
    list(): Promise<Identity[]>;
    /** The providers people may connect, in the order they are shown. */
    providers: Provider[];
    /** Usually a redirect to the provider: it may never resolve. */
    link(provider: string): Promise<void>;
    unlink(id: string): Promise<void>;
  };
  sessions?: {
    /** Leave out when the provider cannot list sessions (Supabase): only
     *  "sign out everywhere else" is shown. */
    list?(): Promise<Session[]>;
    revoke?(id: string): Promise<void>;
    revokeOthers(): Promise<void>;
  };
  deleteAccount?(proof: Reauth): Promise<void>;
}

export type OrgRole = "owner" | "admin" | "member" | (string & {});

export interface Organization {
  slug: string;
  name: string;
  logoUrl?: string | null;
  /** The signed-in person's role: owners and admins edit, members read. */
  role: OrgRole;
}

export interface OrganizationAdapter {
  getOrganization(): Promise<Organization>;
  rename?(name: string): Promise<Organization | void>;
  logo?: {
    upload(file: Blob): Promise<string>;
    remove?(): Promise<void>;
  };
  leave?(): Promise<void>;
  /** Called once the person has typed the slug to confirm. */
  delete?(): Promise<void>;
}

/** One entry in the settings navigation. */
export interface SettingsSection {
  value: string;
  label: ReactNode;
  icon?: IconName;
  content: ReactNode;
}

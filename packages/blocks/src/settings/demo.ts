import type {
  Account,
  AccountAdapter,
  Identity,
  Organization,
  OrganizationAdapter,
  Session,
} from "./types.js";

/**
 * Adapters that keep everything in memory, for docs, tests and an app's demo
 * mode (no auth configured). Every capability is implemented, so every row
 * shows. Writes last until the page reloads. The two-step code is `123456`.
 */

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface DemoAccountOptions {
  account?: Partial<Account>;
  /** Milliseconds each call takes, so loading states can be seen. Default 300. */
  latency?: number;
}

export function createDemoAccountAdapter(options: DemoAccountOptions = {}): AccountAdapter {
  const latency = options.latency ?? 300;
  let account: Account = {
    id: "demo",
    email: "mira@halden.example",
    emailVerified: true,
    name: "Mira Kovács",
    username: "mirak",
    avatarUrl: null,
    hasPassword: true,
    passwordChangedAt: "2026-08-14T09:00:00Z",
    createdAt: "2025-03-02T09:00:00Z",
    ...options.account,
  };
  let twoFactor = false;
  let identities: Identity[] = [
    {
      id: "google-1",
      provider: "google",
      detail: account.email,
      connectedAt: "2026-03-02T09:00:00Z",
    },
  ];
  let sessions: Session[] = [
    { id: "s1", device: "Chrome on Windows", location: "Budapest", current: true },
    {
      id: "s2",
      device: "Safari on iPhone",
      location: "Budapest",
      lastActiveAt: "2026-11-04T18:20:00Z",
    },
  ];
  const step = <T>(value: T) => wait(latency).then(() => value);
  const checkProof = (proof: { password?: string } | { recentSignIn: true }) => {
    if ("password" in proof && !proof.password) throw new Error("Enter your current password.");
  };

  return {
    getAccount: () => step({ ...account }),
    updateProfile: async (patch) => {
      account = { ...account, ...patch };
      return step({ ...account });
    },
    avatar: {
      upload: async (file) => {
        const url =
          typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : "";
        account = { ...account, avatarUrl: url };
        return step(url);
      },
      remove: async () => {
        account = { ...account, avatarUrl: null };
        await step(undefined);
      },
    },
    changeEmail: async (next, proof) => {
      checkProof(proof);
      account = { ...account, pendingEmail: next };
      return step({ pending: next });
    },
    cancelEmailChange: async () => {
      account = { ...account, pendingEmail: null };
      await step(undefined);
    },
    changePassword: async (_next, proof, { signOutOthers }) => {
      checkProof(proof);
      if (signOutOthers) sessions = sessions.filter((session) => session.current);
      await step(undefined);
    },
    twoFactor: {
      enabled: () => step(twoFactor),
      enroll: async (proof) => {
        checkProof(proof);
        return step({
          secret: "JBSWY3DPEHPK3PXP",
          uri: `otpauth://totp/Demo:${encodeURIComponent(account.email)}?secret=JBSWY3DPEHPK3PXP&issuer=Demo`,
        });
      },
      verify: async (code) => {
        await step(undefined);
        if (code !== "123456")
          throw new Error("That code did not match. In the demo it is 123456.");
        twoFactor = true;
        return {
          backupCodes: [
            "7Q2K-9XRM",
            "H4PD-2WLA",
            "N8VC-5TJE",
            "B3ZQ-6GKS",
            "R7MW-1YHU",
            "K2LF-8DNP",
            "T9XE-4CBA",
            "W5JR-3QVM",
            "F6HN-7PZK",
            "D1GS-2UTL",
          ],
        };
      },
      disable: async (code) => {
        await step(undefined);
        if (code !== "123456")
          throw new Error("That code did not match. In the demo it is 123456.");
        twoFactor = false;
      },
    },
    identities: {
      providers: [
        { id: "google", label: "Google" },
        { id: "github", label: "GitHub" },
      ],
      list: () => step([...identities]),
      link: async (provider) => {
        identities = [
          ...identities,
          {
            id: `${provider}-${Date.now()}`,
            provider,
            detail: account.email,
            connectedAt: new Date().toISOString(),
          },
        ];
        await step(undefined);
      },
      unlink: async (id) => {
        identities = identities.filter((identity) => identity.id !== id);
        await step(undefined);
      },
    },
    sessions: {
      list: () => step([...sessions]),
      revoke: async (id) => {
        sessions = sessions.filter((session) => session.id !== id);
        await step(undefined);
      },
      revokeOthers: async () => {
        sessions = sessions.filter((session) => session.current);
        await step(undefined);
      },
    },
    deleteAccount: async (proof) => {
      checkProof(proof);
      await step(undefined);
      throw new Error("Demo accounts cannot be deleted.");
    },
  };
}

export interface DemoOrganizationOptions {
  organization?: Partial<Organization>;
  latency?: number;
}

export function createDemoOrganizationAdapter(
  options: DemoOrganizationOptions = {},
): OrganizationAdapter {
  const latency = options.latency ?? 300;
  let organization: Organization = {
    slug: "halden",
    name: "Halden & Co",
    logoUrl: null,
    role: "owner",
    ...options.organization,
  };
  const step = <T>(value: T) => wait(latency).then(() => value);
  return {
    getOrganization: () => step({ ...organization }),
    rename: async (name) => {
      organization = { ...organization, name };
      return step({ ...organization });
    },
    logo: {
      upload: async (file) => {
        const url =
          typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : "";
        organization = { ...organization, logoUrl: url };
        return step(url);
      },
      remove: async () => {
        organization = { ...organization, logoUrl: null };
        await step(undefined);
      },
    },
    leave: () => step(undefined),
    delete: () => step(undefined),
  };
}

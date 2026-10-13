// @vitest-environment node
import type { LookupAddress } from "node:dns";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * URL checks for the OG handlers, with DNS mocked: `lookup` stands in for
 * `dns.promises.lookup`, keyed by hostname.
 */

const { lookup, records } = vi.hoisted(() => {
  const records = new Map<string, string[]>();
  const lookup = vi.fn(async (hostname: string) => {
    const addresses = records.get(hostname);
    if (!addresses) {
      throw Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), { code: "ENOTFOUND" });
    }
    return addresses.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  });
  return { lookup, records };
});

vi.mock("../server/og-node", () => ({
  loadNodeBuiltins: async () => ({ dns: { promises: { lookup } } }),
}));

import { OGUrlValidationError } from "../server/og-errors";
import type { NodeBuiltins } from "../server/og-node";
import { createPinnedLookup } from "../server/og-transport";
import { validateOgUrl } from "../server/og-url-validation";

const dns = { promises: { lookup } } as unknown as NodeBuiltins["dns"];

beforeEach(() => {
  lookup.mockClear();
  records.clear();
  records.set("example.com", ["93.184.216.34"]);
  records.set("cdn.allowed.test", ["93.184.216.35"]);
});

const rejects = (promise: Promise<unknown>) =>
  expect(promise).rejects.toBeInstanceOf(OGUrlValidationError);

describe("validateOgUrl", () => {
  it("allows a public HTTPS URL whose name resolves to public addresses", async () => {
    const url = await validateOgUrl("https://example.com/page");

    expect(url.hostname).toBe("example.com");
    expect(lookup).toHaveBeenCalledWith("example.com", { all: true });
  });

  it("allows HTTPS only, unless HTTP is opted into", async () => {
    await rejects(validateOgUrl("http://example.com/"));
    await expect(validateOgUrl("http://example.com/", { allowHttp: true })).resolves.toBeDefined();
  });

  it("refuses every other scheme, even with HTTP allowed", async () => {
    for (const url of [
      "file:///etc/passwd",
      "ftp://example.com/",
      "gopher://example.com/",
      "data:text/html,hi",
      "javascript:alert(1)",
      "ws://example.com/",
    ]) {
      await rejects(validateOgUrl(url, { allowHttp: true }));
    }
  });

  it("refuses malformed URLs and embedded credentials", async () => {
    await rejects(validateOgUrl("not-a-url"));
    await rejects(validateOgUrl("https://user:pass@example.com/"));
    await rejects(validateOgUrl("https://user@example.com/"));
  });

  it("refuses non-public IP literals in every encoding, without resolving them", async () => {
    for (const url of [
      "https://127.0.0.1/",
      "https://2130706433/",
      "https://0x7f.1/",
      "https://0x7f000001/",
      "https://017700000001/",
      "https://0177.0.0.1/",
      "https://127.1/",
      "https://10.0.0.1/",
      "https://172.16.0.1/",
      "https://192.168.1.1/",
      "https://100.64.0.1/",
      "https://169.254.169.254/latest/meta-data/",
      "https://0.0.0.0/",
      "https://224.0.0.1/",
      "https://[::1]/",
      "https://[::]/",
      "https://[::ffff:127.0.0.1]/",
      "https://[::ffff:a9fe:a9fe]/",
      "https://[fd00:ec2::254]/",
      "https://[fc00::1]/",
      "https://[fe80::1]/",
      "https://[ff02::1]/",
      "https://[64:ff9b::7f00:1]/",
    ]) {
      await rejects(validateOgUrl(url));
    }
    expect(lookup).not.toHaveBeenCalled();
  });

  it("allows public IP literals without resolving them", async () => {
    await expect(validateOgUrl("https://93.184.216.34/")).resolves.toBeDefined();
    await expect(validateOgUrl("https://[2606:4700:4700::1111]/")).resolves.toBeDefined();
    expect(lookup).not.toHaveBeenCalled();
  });

  it("refuses internal and single-label hostnames", async () => {
    for (const url of [
      "https://localhost/",
      "https://app.localhost/",
      "https://metadata.google.internal/",
      "https://service.internal/",
      "https://printer.local/",
      "https://router.home.arpa/",
      "https://intranet/",
    ]) {
      await rejects(validateOgUrl(url));
    }
    expect(lookup).not.toHaveBeenCalled();
  });

  it("refuses names that resolve to any non-public address", async () => {
    records.set("private.example", ["10.0.0.5"]);
    records.set("loopback.example", ["127.0.0.1"]);
    records.set("metadata.example", ["169.254.169.254"]);
    records.set("mapped.example", ["::ffff:127.0.0.1"]);
    records.set("ula.example", ["fd00:ec2::254"]);
    records.set("mixed.example", ["93.184.216.34", "192.168.0.10"]);

    for (const host of [
      "private.example",
      "loopback.example",
      "metadata.example",
      "mapped.example",
      "ula.example",
      "mixed.example",
    ]) {
      await rejects(validateOgUrl(`https://${host}/`));
    }
  });

  it("refuses names that do not resolve", async () => {
    await rejects(validateOgUrl("https://nowhere.example/"));
  });

  it("enforces the domain allowlist and blocklist", async () => {
    await rejects(validateOgUrl("https://example.com", { allowedDomains: ["allowed.test"] }));
    await expect(
      validateOgUrl("https://cdn.allowed.test/image.png", { allowedDomains: ["allowed.test"] }),
    ).resolves.toBeDefined();

    await rejects(validateOgUrl("https://example.com/", { blockedDomains: ["example.com"] }));
    await rejects(validateOgUrl("https://cdn.allowed.test/", { blockedDomains: ["allowed.test"] }));
  });

  it("lets an allowlist narrow but never widen the built-in checks", async () => {
    await rejects(validateOgUrl("https://localhost/", { allowedDomains: ["localhost"] }));
    records.set("intranet.example", ["10.1.2.3"]);
    await rejects(
      validateOgUrl("https://intranet.example/", { allowedDomains: ["intranet.example"] }),
    );
  });

  it("asks the isAllowed hook last, with a copy of the URL", async () => {
    const isAllowed = vi.fn((url: URL) => url.pathname !== "/private");

    await expect(validateOgUrl("https://example.com/public", { isAllowed })).resolves.toBeDefined();
    await rejects(validateOgUrl("https://example.com/private", { isAllowed }));
    await rejects(validateOgUrl("https://127.0.0.1/public", { isAllowed }));

    expect(isAllowed).toHaveBeenCalledTimes(2);
  });
});

describe("createPinnedLookup", () => {
  type LookupResult = {
    error: NodeJS.ErrnoException | null;
    address?: string | LookupAddress[];
    family?: number;
  };

  // Calls the pinned lookup the way net.connect does.
  const callLookup = (hostname: string, options: { all?: boolean; family?: number } = {}) =>
    new Promise<LookupResult>((resolve) => {
      const lookupFn = createPinnedLookup(dns) as unknown as (
        hostname: string,
        options: object,
        callback: (...args: [LookupResult["error"], LookupResult["address"]?, number?]) => void,
      ) => void;
      lookupFn(hostname, options, (error, address, family) => resolve({ error, address, family }));
    });

  it("hands Node the checked address, one or all", async () => {
    records.set("dual.example", ["93.184.216.34", "2606:2800:220:1::1"]);

    const one = await callLookup("dual.example");
    expect(one).toEqual({ error: null, address: "93.184.216.34", family: 4 });

    const all = await callLookup("dual.example", { all: true });
    expect(all.error).toBeNull();
    expect(all.address as LookupAddress[]).toEqual([
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1::1", family: 6 },
    ]);

    const v6 = await callLookup("dual.example", { family: 6 });
    expect(v6).toEqual({ error: null, address: "2606:2800:220:1::1", family: 6 });
  });

  it("fails the connection when the name resolves to a non-public address", async () => {
    records.set("rebind.example", ["127.0.0.1"]);

    const { error, address } = await callLookup("rebind.example", { all: true });

    expect(error).toBeInstanceOf(OGUrlValidationError);
    expect(address).toBeUndefined();
  });

  it("resolves at connect time, so an answer that changed since an earlier check is still caught", async () => {
    records.set("flip.example", ["93.184.216.34"]);
    await expect(validateOgUrl("https://flip.example/")).resolves.toBeDefined();

    records.set("flip.example", ["10.0.0.1"]);
    const { error } = await callLookup("flip.example");

    expect(error).toBeInstanceOf(OGUrlValidationError);
  });

  it("reports ENOTFOUND when no address of the requested family exists", async () => {
    const { error } = await callLookup("example.com", { family: 6 });

    expect(error?.code).toBe("ENOTFOUND");
  });
});

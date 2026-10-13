/**
 * Address classification for the OG fetch and proxy handlers.
 *
 * Pure functions, no I/O: given an IP address (or a hostname), decide whether
 * a server-side request may be sent there. Only globally routable unicast
 * addresses pass. Everything else (private, loopback, link-local, unique-local,
 * carrier-grade NAT, multicast, unspecified, documentation and benchmarking
 * ranges, cloud metadata endpoints) is refused, including when an IPv4
 * address is embedded in an IPv6 one.
 */

interface IPv4Range {
  network: number;
  prefix: number;
}

const BLOCKED_IPV4_RANGES: IPv4Range[] = [
  { network: 0x00000000, prefix: 8 }, // 0.0.0.0/8 "this network", unspecified
  { network: 0x0a000000, prefix: 8 }, // 10.0.0.0/8 private
  { network: 0x64400000, prefix: 10 }, // 100.64.0.0/10 carrier-grade NAT
  { network: 0x7f000000, prefix: 8 }, // 127.0.0.0/8 loopback
  { network: 0xa9fe0000, prefix: 16 }, // 169.254.0.0/16 link-local, cloud metadata
  { network: 0xac100000, prefix: 12 }, // 172.16.0.0/12 private
  { network: 0xc0000000, prefix: 24 }, // 192.0.0.0/24 IETF protocol assignments
  { network: 0xc0000200, prefix: 24 }, // 192.0.2.0/24 documentation
  { network: 0xc0586300, prefix: 24 }, // 192.88.99.0/24 6to4 relay anycast
  { network: 0xc0a80000, prefix: 16 }, // 192.168.0.0/16 private
  { network: 0xc6120000, prefix: 15 }, // 198.18.0.0/15 benchmarking
  { network: 0xc6336400, prefix: 24 }, // 198.51.100.0/24 documentation
  { network: 0xcb007100, prefix: 24 }, // 203.0.113.0/24 documentation
  { network: 0xe0000000, prefix: 4 }, // 224.0.0.0/4 multicast
  { network: 0xf0000000, prefix: 4 }, // 240.0.0.0/4 reserved, broadcast
];

const ipv4Mask = (prefix: number): number =>
  prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

const IPV4_NUMBER = {
  10: /^[0-9]+$/,
  8: /^[0-7]+$/,
  16: /^[0-9a-f]+$/i,
} as const;

function parseIPv4Number(part: string): number | null {
  if (part === "") {
    return null;
  }

  let radix: 10 | 8 | 16 = 10;
  let digits = part;
  if (/^0x/i.test(part)) {
    radix = 16;
    digits = part.slice(2);
  } else if (part.length > 1 && part.startsWith("0")) {
    radix = 8;
    digits = part.slice(1);
  }

  if (digits === "") {
    return 0;
  }
  if (!IPV4_NUMBER[radix].test(digits)) {
    return null;
  }

  const value = Number.parseInt(digits, radix);
  return Number.isSafeInteger(value) ? value : null;
}

/**
 * Parses an IPv4 address the way the WHATWG URL parser (and `inet_aton`)
 * does: one to four parts, each decimal, octal (`0` prefix) or hex (`0x`
 * prefix), the last part filling the remaining bytes. So `127.0.0.1`,
 * `2130706433`, `0x7f.1` and `0177.0.0.1` are all the loopback address.
 * Returns the address as an unsigned 32-bit integer, or `null`.
 */
export function parseIPv4(input: string): number | null {
  let parts = input.split(".");
  if (parts.length > 1 && parts[parts.length - 1] === "") {
    parts = parts.slice(0, -1);
  }
  if (parts.length === 0 || parts.length > 4) {
    return null;
  }

  const numbers: number[] = [];
  for (const part of parts) {
    const value = parseIPv4Number(part);
    if (value === null) {
      return null;
    }
    numbers.push(value);
  }

  const last = numbers.pop() as number;
  if (numbers.some((value) => value > 255) || last >= 256 ** (4 - numbers.length)) {
    return null;
  }

  let address = last;
  numbers.forEach((value, index) => {
    address += value * 256 ** (3 - index);
  });
  return address >>> 0;
}

function parseDottedQuad(input: string): number | null {
  const parts = input.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    return null;
  }
  return parts.reduce((address, part) => address * 256 + Number(part), 0) >>> 0;
}

/**
 * Parses an IPv6 address, with or without brackets, including the forms that
 * end in a dotted IPv4 address (`::ffff:127.0.0.1`). Zone identifiers
 * (`fe80::1%eth0`) are rejected. Returns the address as a 128-bit bigint, or
 * `null`.
 */
export function parseIPv6(input: string): bigint | null {
  let address = input.toLowerCase();
  if (address.startsWith("[") && address.endsWith("]")) {
    address = address.slice(1, -1);
  }
  if (!address.includes(":") || address.includes("%")) {
    return null;
  }

  const lastColon = address.lastIndexOf(":");
  const lastPart = address.slice(lastColon + 1);
  if (lastPart.includes(".")) {
    const embedded = parseDottedQuad(lastPart);
    if (embedded === null) {
      return null;
    }
    address =
      `${address.slice(0, lastColon + 1)}` +
      `${(embedded >>> 16).toString(16)}:${(embedded & 0xffff).toString(16)}`;
  }

  const halves = address.split("::");
  if (halves.length > 2) {
    return null;
  }
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if (halves.length === 1 ? head.length !== 8 : head.length + tail.length > 7) {
    return null;
  }

  const groups = [
    ...head,
    ...Array.from({ length: 8 - head.length - tail.length }, () => "0"),
    ...tail,
  ];

  let value = 0n;
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) {
      return null;
    }
    value = (value << 16n) + BigInt(Number.parseInt(group, 16));
  }
  return value;
}

export function isBlockedIPv4(address: number): boolean {
  return BLOCKED_IPV4_RANGES.some(
    ({ network, prefix }) => (address & ipv4Mask(prefix)) >>> 0 === network,
  );
}

const low32 = (value: bigint): number => Number(value & 0xffffffffn);

export function isBlockedIPv6(address: bigint): boolean {
  const upper96 = address >> 32n;

  // IPv4-mapped (::ffff:0:0/96) and IPv4-translated (::ffff:0:0:0/96):
  // the connection goes to the embedded IPv4 address, so judge that.
  if (upper96 === 0xffffn || upper96 === 0xffff0000n) {
    return isBlockedIPv4(low32(address));
  }

  // NAT64 well-known prefix (64:ff9b::/96): the embedded IPv4 address is the
  // real destination on IPv6-only networks with DNS64.
  if (upper96 === 0x64ff9b0000000000000000n) {
    return isBlockedIPv4(low32(address));
  }

  // Only global unicast (2000::/3) is publicly routable. This refuses the
  // unspecified address (::), loopback (::1), IPv4-compatible (::/96),
  // discard (100::/64), local-use NAT64 (64:ff9b:1::/48), unique-local
  // (fc00::/7, which holds the fd00:ec2::254 metadata endpoint), link-local
  // (fe80::/10), site-local (fec0::/10) and multicast (ff00::/8).
  if (address >> 125n !== 1n) {
    return true;
  }

  const top16 = address >> 112n;
  return (
    // 2001::/23 IETF protocol assignments, including Teredo (2001::/32)
    address >> 105n === 0x2001n << 7n ||
    // 2001:db8::/32 documentation
    address >> 96n === 0x20010db8n ||
    // 2002::/16 6to4, deprecated; relays route it unpredictably
    top16 === 0x2002n ||
    // 3fff::/20 documentation
    address >> 108n === 0x3fffn << 4n
  );
}

/**
 * Whether a request may be sent to this IP address. Anything that does not
 * parse as an IPv4 or IPv6 address is refused.
 */
export function isPublicIpAddress(ip: string): boolean {
  const v6 = parseIPv6(ip);
  if (v6 !== null) {
    return !isBlockedIPv6(v6);
  }
  const v4 = parseDottedQuad(ip);
  if (v4 !== null) {
    return !isBlockedIPv4(v4);
  }
  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata",
  "metadata.google",
  "metadata.google.internal",
  "instance-data",
]);

// Names that only ever resolve inside a private network. Checked before DNS
// as a second line of defence; the address check after resolution is what
// actually decides.
const BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".home.arpa",
  ".localdomain",
  ".lan",
  ".intranet",
  ".corp",
  ".home",
];

export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "");
}

/**
 * Classifies a URL hostname without resolving it.
 *
 * - `"blocked"`: an internal name, a single-label name (resolved through the
 *   server's search domains), or a non-public IP literal.
 * - `"ip"`: a public IP literal; there is nothing to resolve.
 * - `"name"`: a public-looking DNS name; its addresses must be checked.
 */
export function classifyHostname(hostname: string): "blocked" | "ip" | "name" {
  const normalized = normalizeHostname(hostname);
  if (!normalized) {
    return "blocked";
  }

  const v6 = parseIPv6(normalized);
  if (v6 !== null) {
    return isBlockedIPv6(v6) ? "blocked" : "ip";
  }
  if (normalized.startsWith("[")) {
    return "blocked";
  }

  // A name whose last label is numeric is an IPv4 address to the URL parser
  // (`0x7f.1`, `2130706433`), so treat it as one here too.
  const lastLabel = normalized.slice(normalized.lastIndexOf(".") + 1);
  if (/^(0x[0-9a-f]*|\d+)$/i.test(lastLabel)) {
    const v4 = parseIPv4(normalized);
    return v4 === null || isBlockedIPv4(v4) ? "blocked" : "ip";
  }

  if (
    !normalized.includes(".") ||
    BLOCKED_HOSTNAMES.has(normalized) ||
    BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
  ) {
    return "blocked";
  }

  return "name";
}

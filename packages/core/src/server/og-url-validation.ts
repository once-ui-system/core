export class OGUrlValidationError extends Error {
  constructor(message = 'URL is not allowed') {
    super(message);
    this.name = 'OGUrlValidationError';
  }
}

export interface OGUrlValidationOptions {
  /** When set, only these domains (and their subdomains) are permitted. */
  allowedDomains?: string[];
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.google',
]);

const BLOCKED_HOSTNAME_SUFFIXES = ['.localhost', '.local', '.internal'];

interface IPv4Range {
  network: number;
  mask: number;
}

const BLOCKED_IPV4_RANGES: IPv4Range[] = [
  { network: 0x00000000, mask: 0xff000000 }, // 0.0.0.0/8
  { network: 0x0a000000, mask: 0xff000000 }, // 10.0.0.0/8
  { network: 0x64400000, mask: 0xffc00000 }, // 100.64.0.0/10
  { network: 0x7f000000, mask: 0xff000000 }, // 127.0.0.0/8
  { network: 0xa9fe0000, mask: 0xffff0000 }, // 169.254.0.0/16
  { network: 0xac100000, mask: 0xfff00000 }, // 172.16.0.0/12
  { network: 0xc0000000, mask: 0xffffff00 }, // 192.0.0.0/24
  { network: 0xc0000200, mask: 0xffffff00 }, // 192.0.2.0/24 (TEST-NET-1)
  { network: 0xc0a80000, mask: 0xffff0000 }, // 192.168.0.0/16
  { network: 0xc6120000, mask: 0xfffe0000 }, // 198.18.0.0/15
  { network: 0xc6336400, mask: 0xffffff00 }, // 198.51.100.0/24 (TEST-NET-2)
  { network: 0xcb007100, mask: 0xffffff00 }, // 203.0.113.0/24 (TEST-NET-3)
  { network: 0xe0000000, mask: 0xf0000000 }, // 224.0.0.0/4 (multicast)
  { network: 0xf0000000, mask: 0xf0000000 }, // 240.0.0.0/4 (reserved)
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return null;
  }

  let value = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return null;
    }
    const octet = Number(part);
    if (octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) + octet;
  }

  return value >>> 0;
}

function isBlockedIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  if (value === null) {
    return true;
  }

  return BLOCKED_IPV4_RANGES.some(
    (range) => (value & range.mask) === (range.network & range.mask),
  );
}

function expandIPv6(ip: string): bigint | null {
  const lower = ip.toLowerCase();

  if (lower.includes('%')) {
    return null;
  }

  const [head, tail = ''] = lower.split('::');
  if (lower.split('::').length > 2) {
    return null;
  }

  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const missingGroups = 8 - (headGroups.length + tailGroups.length);

  if (missingGroups < 0) {
    return null;
  }

  const groups = [
    ...headGroups,
    ...Array.from({ length: missingGroups }, () => '0'),
    ...tailGroups,
  ];

  if (groups.length !== 8) {
    return null;
  }

  let value = 0n;
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) {
      return null;
    }
    value = (value << 16n) + BigInt(parseInt(group, 16));
  }

  return value;
}

function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === '::1') {
    return true;
  }

  const value = expandIPv6(normalized);
  if (value === null) {
    return true;
  }

  // Unique local addresses (fc00::/7)
  if ((value & 0xfe00_0000_0000_0000_0000_0000_0000_0000n) === 0xfc00_0000_0000_0000_0000_0000_0000_0000n) {
    return true;
  }

  // Link-local addresses (fe80::/10)
  if ((value & 0xffc0_0000_0000_0000_0000_0000_0000_0000n) === 0xfe80_0000_0000_0000_0000_0000_0000_0000n) {
    return true;
  }

  // IPv4-mapped IPv6 addresses (::ffff:x.x.x.x)
  if ((value & 0xffff_ffff_ffff_ffff_0000_0000_0000_0000n) === 0x0000_0000_0000_0000_0000_ffff_0000_0000n) {
    const mappedIpv4 =
      `${Number((value >> 24n) & 0xffn)}.` +
      `${Number((value >> 16n) & 0xffn)}.` +
      `${Number((value >> 8n) & 0xffn)}.` +
      `${Number(value & 0xffn)}`;
    return isBlockedIPv4(mappedIpv4);
  }

  return false;
}

function parseIpAddress(hostname: string): string | null {
  let candidate = hostname;

  if (candidate.startsWith('[') && candidate.endsWith(']')) {
    candidate = candidate.slice(1, -1);
  }

  if (ipv4ToInt(candidate) !== null) {
    return candidate;
  }

  if (expandIPv6(candidate) !== null) {
    return candidate;
  }

  return null;
}

function isBlockedIpAddress(ip: string): boolean {
  if (ip.includes(':')) {
    return isBlockedIPv6(ip);
  }

  return isBlockedIPv4(ip);
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');

  if (BLOCKED_HOSTNAMES.has(normalized)) {
    return true;
  }

  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) {
    return true;
  }

  const ipAddress = parseIpAddress(normalized);
  return ipAddress ? isBlockedIpAddress(ipAddress) : false;
}

function isDomainAllowed(hostname: string, allowedDomains: string[]): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');

  return allowedDomains.some((domain) => {
    const allowed = domain.toLowerCase();
    return normalized === allowed || normalized.endsWith(`.${allowed}`);
  });
}

async function resolveHostnameAddresses(hostname: string): Promise<string[]> {
  // Use the bare specifier instead of "node:dns": webpack cannot handle the
  // "node:" URI scheme when this package is processed via transpilePackages.
  const dns = await import('dns');
  const addresses = new Set<string>();

  await Promise.all([
    dns.promises.resolve4(hostname).then((ips) => {
      for (const ip of ips) {
        addresses.add(ip);
      }
    }).catch(() => undefined),
    dns.promises.resolve6(hostname).then((ips) => {
      for (const ip of ips) {
        addresses.add(ip);
      }
    }).catch(() => undefined),
  ]);

  if (addresses.size === 0) {
    throw new OGUrlValidationError('URL hostname could not be resolved');
  }

  return [...addresses];
}

function parsePublicUrl(urlString: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(urlString);
  } catch {
    throw new OGUrlValidationError('URL is malformed');
  }

  if (parsed.protocol !== 'https:') {
    throw new OGUrlValidationError('Only HTTPS URLs are allowed');
  }

  if (parsed.username || parsed.password) {
    throw new OGUrlValidationError('URL credentials are not allowed');
  }

  if (!parsed.hostname) {
    throw new OGUrlValidationError('URL hostname is required');
  }

  return parsed;
}

export async function validateOgUrl(
  urlString: string,
  options: OGUrlValidationOptions = {},
): Promise<URL> {
  const parsed = parsePublicUrl(urlString);
  const hostname = parsed.hostname.toLowerCase();

  if (options.allowedDomains?.length) {
    if (!isDomainAllowed(hostname, options.allowedDomains)) {
      throw new OGUrlValidationError('URL domain is not allowed');
    }
  }

  if (isBlockedHostname(hostname)) {
    throw new OGUrlValidationError('URL hostname is not allowed');
  }

  const ipAddress = parseIpAddress(hostname);
  if (!ipAddress) {
    const resolvedAddresses = await resolveHostnameAddresses(hostname);
    for (const address of resolvedAddresses) {
      if (isBlockedIpAddress(address)) {
        throw new OGUrlValidationError('URL resolves to a blocked address');
      }
    }
  }

  return parsed;
}

const MAX_REDIRECTS = 3;

export async function fetchValidatedUrl(
  urlString: string,
  init: RequestInit = {},
  validationOptions: OGUrlValidationOptions = {},
): Promise<Response> {
  let currentUrl = urlString;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    await validateOgUrl(currentUrl, validationOptions);

    const response = await fetch(currentUrl, {
      ...init,
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new OGUrlValidationError('Redirect response missing location');
      }

      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    return response;
  }

  throw new OGUrlValidationError('Too many redirects');
}

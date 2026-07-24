import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OGUrlValidationError,
  fetchValidatedUrl,
  validateOgUrl,
} from '../server/og-url-validation';

const resolve4 = vi.fn();
const resolve6 = vi.fn();

vi.mock('dns', () => ({
  promises: {
    resolve4,
    resolve6,
  },
}));

describe('validateOgUrl', () => {
  beforeEach(() => {
    resolve4.mockReset();
    resolve6.mockReset();
    resolve4.mockRejectedValue(new Error('ENOTFOUND'));
    resolve6.mockRejectedValue(new Error('ENOTFOUND'));
  });

  it('allows public HTTPS URLs after DNS resolves to a public address', async () => {
    resolve4.mockResolvedValue(['93.184.216.34']);

    const url = await validateOgUrl('https://example.com/page');

    expect(url.hostname).toBe('example.com');
  });

  it('rejects missing and malformed URLs', async () => {
    await expect(validateOgUrl('not-a-url')).rejects.toBeInstanceOf(OGUrlValidationError);
    await expect(validateOgUrl('http://example.com')).rejects.toBeInstanceOf(OGUrlValidationError);
    await expect(validateOgUrl('file:///etc/passwd')).rejects.toBeInstanceOf(OGUrlValidationError);
  });

  it('rejects URLs with embedded credentials', async () => {
    await expect(validateOgUrl('https://user:pass@example.com')).rejects.toBeInstanceOf(
      OGUrlValidationError,
    );
  });

  it('blocks private, loopback, and metadata IP literals', async () => {
    const blockedUrls = [
      'https://127.0.0.1/',
      'https://10.0.0.1/',
      'https://172.16.0.1/',
      'https://192.168.1.1/',
      'https://169.254.169.254/latest/meta-data/',
      'https://[::1]/',
      'https://[fc00::1]/',
      'https://[fe80::1]/',
    ];

    for (const blockedUrl of blockedUrls) {
      await expect(validateOgUrl(blockedUrl)).rejects.toBeInstanceOf(OGUrlValidationError);
    }
  });

  it('blocks localhost and internal hostnames', async () => {
    await expect(validateOgUrl('https://localhost/')).rejects.toBeInstanceOf(OGUrlValidationError);
    await expect(validateOgUrl('https://app.localhost/')).rejects.toBeInstanceOf(OGUrlValidationError);
    await expect(validateOgUrl('https://metadata.google.internal/')).rejects.toBeInstanceOf(
      OGUrlValidationError,
    );
    await expect(validateOgUrl('https://service.internal/')).rejects.toBeInstanceOf(
      OGUrlValidationError,
    );
  });

  it('blocks hostnames that resolve to private addresses', async () => {
    resolve4.mockResolvedValue(['10.0.0.5']);

    await expect(validateOgUrl('https://public-looking.example/')).rejects.toBeInstanceOf(
      OGUrlValidationError,
    );
  });

  it('enforces optional domain allowlists', async () => {
    resolve4.mockResolvedValue(['93.184.216.34']);

    await expect(
      validateOgUrl('https://example.com', { allowedDomains: ['allowed.test'] }),
    ).rejects.toBeInstanceOf(OGUrlValidationError);

    await expect(
      validateOgUrl('https://cdn.allowed.test/image.png', { allowedDomains: ['allowed.test'] }),
    ).resolves.toBeDefined();
  });
});

describe('fetchValidatedUrl', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resolve4.mockReset();
    resolve6.mockReset();
    resolve4.mockResolvedValue(['93.184.216.34']);
    resolve6.mockRejectedValue(new Error('ENOTFOUND'));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('re-validates redirect targets and blocks private redirect destinations', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { Location: 'https://127.0.0.1/secret' },
        }),
      ) as typeof fetch;

    await expect(fetchValidatedUrl('https://example.com/start')).rejects.toBeInstanceOf(
      OGUrlValidationError,
    );
  });

  it('follows safe redirects manually', async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { Location: '/final' },
        }),
      )
      .mockResolvedValueOnce(new Response('ok', { status: 200 })) as typeof fetch;

    const response = await fetchValidatedUrl('https://example.com/start');

    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      'https://example.com/start',
      expect.objectContaining({ redirect: 'manual' }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      'https://example.com/final',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });
});

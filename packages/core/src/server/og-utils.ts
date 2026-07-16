import { NextResponse } from 'next/server';
import {
  fetchValidatedUrl,
  OGUrlValidationError,
  type OGUrlValidationOptions,
  validateOgUrl,
} from './og-url-validation';

export interface OGData {
  url: string;
  title: string;
  description: string;
  image: string;
  faviconUrl?: string;
}

export interface OGFetchOptions extends OGUrlValidationOptions {
  timeout?: number;
  userAgent?: string;
  decodeEntities?: boolean;
}

function decodeHTMLEntities(text: string): string {
  return text.replace(/&(#?[a-zA-Z0-9]+);/g, (match, entity) => {
    const entities: { [key: string]: string } = {
      'amp': '&',
      'lt': '<',
      'gt': '>',
      'quot': '"',
      'apos': "'",
      '#x27': "'",
      '#39': "'",
      '#x26': '&',
      '#38': '&'
    };
    
    if (entity.startsWith('#')) {
      const code = entity.startsWith('#x') ? 
        parseInt(entity.slice(2), 16) : 
        parseInt(entity.slice(1), 10);
      return String.fromCharCode(code);
    }
    
    return entities[entity] || match;
  });
}

async function fetchWithTimeout(
  url: string,
  timeout = 5000,
  userAgent = 'Mozilla/5.0 (compatible; OG-Fetcher/1.0)',
  validationOptions: OGUrlValidationOptions = {},
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchValidatedUrl(
      url,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': userAgent,
        },
      },
      validationOptions,
    );
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function validationErrorResponse(): NextResponse {
  return NextResponse.json({ error: 'URL is not allowed' }, { status: 400 });
}

export async function handleOGFetch(request: Request, options: OGFetchOptions = {}): Promise<NextResponse> {
  const {
    timeout = 5000,
    userAgent = 'Mozilla/5.0 (compatible; OG-Fetcher/1.0)',
    decodeEntities = true,
    allowedDomains,
  } = options;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const validationOptions = { allowedDomains };

  try {
    await validateOgUrl(url, validationOptions);
  } catch (error) {
    if (error instanceof OGUrlValidationError) {
      return validationErrorResponse();
    }
    return validationErrorResponse();
  }

  try {
    const response = await fetchWithTimeout(url, timeout, userAgent, validationOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    const ogData: OGData = {
      url: url,
      title: '',
      description: '',
      image: '',
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      ogData.title = titleMatch[1].trim();
    }

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogTitleMatch) {
      ogData.title = ogTitleMatch[1].trim();
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)
      || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (descMatch) {
      ogData.description = descMatch[1].trim();
    }

    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    if (ogImageMatch) {
      ogData.image = ogImageMatch[1].trim();
    }

    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if (faviconMatch) {
      ogData.faviconUrl = faviconMatch[1].trim();
    }

    if (decodeEntities) {
      ogData.title = decodeHTMLEntities(ogData.title);
      ogData.description = decodeHTMLEntities(ogData.description);
    }

    return NextResponse.json(ogData);
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Open Graph data' },
      { status: 500 }
    );
  }
}

export interface OGProxyOptions extends OGUrlValidationOptions {
  userAgent?: string;
  cacheMaxAge?: number;
}

export async function handleOGProxy(request: Request, options: OGProxyOptions = {}): Promise<NextResponse> {
  const {
    userAgent = 'Mozilla/5.0 (compatible; OG-Proxy/1.0)',
    cacheMaxAge = 3600,
    allowedDomains,
  } = options;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const validationOptions = { allowedDomains };

  try {
    await validateOgUrl(url, validationOptions);
  } catch (error) {
    if (error instanceof OGUrlValidationError) {
      return validationErrorResponse();
    }
    return validationErrorResponse();
  }

  try {
    const response = await fetchValidatedUrl(
      url,
      {
        headers: {
          'User-Agent': userAgent,
        },
      },
      validationOptions,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status >= 400 && response.status < 600 ? response.status : 502 }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${cacheMaxAge}`,
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}

export { OGUrlValidationError, validateOgUrl } from './og-url-validation';
export type { OGUrlValidationOptions } from './og-url-validation';

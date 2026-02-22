import { NextRequest } from 'next/server';
import { handleOGProxy } from '@once-ui-system/core/server';

export async function GET(request: NextRequest) {
  return handleOGProxy(request, {
    userAgent: 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
    cacheMaxAge: 86400
  });
}

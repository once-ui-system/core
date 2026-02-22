import { NextRequest } from 'next/server';
import { handleOGFetch } from '@once-ui-system/core/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return handleOGFetch(request, {
    timeout: 5000,
    userAgent: 'bot',
    decodeEntities: true
  });
}